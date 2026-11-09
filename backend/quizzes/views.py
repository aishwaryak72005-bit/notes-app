from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Quiz, Question, AnswerOption, QuizAttempt, StudentAnswer
from .serializers import (
    QuizDetailSerializer,
    QuestionDetailSerializer,
    QuizAttemptSerializer,
)
from accounts.permissions import IsTeacher
from progress.models import StudentProgress

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.filter(is_published=True).prefetch_related('questions__options')
    serializer_class = QuizDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTeacher()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        qs = Quiz.objects.all().prefetch_related('questions__options')
        if not (self.request.user.is_authenticated and (self.request.user.role in ['teacher', 'admin'] or self.request.user.is_superuser)):
            qs = qs.filter(is_published=True)
            
        concept_id = self.request.query_params.get('concept_id')
        module_id = self.request.query_params.get('module_id')
        if concept_id:
            from content.models import Concept
            conc = Concept.objects.filter(id=concept_id).first()
            if conc and conc.module_id:
                concept_qs = qs.filter(concept_id=concept_id)
                if concept_qs.exists():
                    return concept_qs
                # Fallback to the uploaded practice quiz for this module
                return qs.filter(module_id=conc.module_id)
            qs = qs.filter(concept_id=concept_id)
        elif module_id:
            qs = qs.filter(module_id=module_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().prefetch_related('options')
    serializer_class = QuestionDetailSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        qs = super().get_queryset()
        quiz_id = self.request.query_params.get('quiz_id')
        if quiz_id:
            qs = qs.filter(quiz_id=quiz_id)
        return qs


class SubmitQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, quiz_id):
        student = request.user
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        # User payload: { answers: { question_id: selected_option_id_or_text }, time_taken_seconds: 120 }
        answers_data = request.data.get('answers', {})
        time_taken = int(request.data.get('time_taken_seconds', 0))

        questions = quiz.questions.all().prefetch_related('options')
        total_questions = questions.count()

        if total_questions == 0:
            return Response({'error': 'This quiz has no questions yet.'}, status=status.HTTP_400_BAD_REQUEST)

        correct_count = 0
        feedback_list = []

        # Create Quiz Attempt record in MySQL
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            total_questions=total_questions,
            time_taken_seconds=time_taken,
        )

        for q in questions:
            user_response = answers_data.get(str(q.id)) or answers_data.get(q.id)
            is_correct = False
            selected_option = None
            text_ans = None

            if q.question_type in [Question.TYPE_MCQ, Question.TYPE_TRUE_FALSE, Question.TYPE_PREDICT_OUTPUT, Question.TYPE_FIND_ERROR]:
                if user_response:
                    try:
                        selected_option = AnswerOption.objects.get(id=int(user_response), question=q)
                        if selected_option.is_correct:
                            is_correct = True
                    except (AnswerOption.DoesNotExist, ValueError):
                        is_correct = False
            elif q.question_type == Question.TYPE_FILL_BLANK:
                text_ans = str(user_response).strip().lower() if user_response else ""
                # Check against correct option text
                correct_opt = q.options.filter(is_correct=True).first()
                if correct_opt and text_ans == correct_opt.option_text.strip().lower():
                    is_correct = True

            if is_correct:
                correct_count += 1

            # Log individual answer
            StudentAnswer.objects.create(
                attempt=attempt,
                question=q,
                selected_option=selected_option,
                text_answer=text_ans,
                is_correct=is_correct,
            )

            # Build detailed feedback response
            correct_opts = q.options.filter(is_correct=True)
            feedback_list.append({
                'question_id': q.id,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'code_snippet': q.code_snippet,
                'user_selected_option_id': selected_option.id if selected_option else None,
                'user_text_answer': text_ans,
                'is_correct': is_correct,
                'correct_option_ids': [opt.id for opt in correct_opts],
                'correct_option_texts': [opt.option_text for opt in correct_opts],
                'explanation': q.explanation,
            })

        # Calculate score percentage
        score_percentage = round((correct_count / total_questions) * 100, 1)
        passed = score_percentage >= quiz.passing_score_percentage

        attempt.score_percentage = score_percentage
        attempt.correct_answers = correct_count
        attempt.incorrect_answers = total_questions - correct_count
        attempt.passed = passed
        attempt.save()

        # Update student progress if quiz is tied to a concept
        if quiz.concept and passed:
            StudentProgress.objects.update_or_create(
                student=student,
                concept=quiz.concept,
                defaults={'is_completed': True}
            )

        return Response({
            'attempt_id': attempt.id,
            'quiz_title': quiz.title,
            'score_percentage': score_percentage,
            'total_questions': total_questions,
            'correct_answers': correct_count,
            'incorrect_answers': total_questions - correct_count,
            'passed': passed,
            'passing_score_percentage': quiz.passing_score_percentage,
            'time_taken_seconds': time_taken,
            'feedback': feedback_list,
        }, status=status.HTTP_200_OK)


class QuizAttemptListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(student=request.user).select_related('quiz').order_by('-completed_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)


class GenerateAIQuizView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        import os
        import json
        import re
        import google.generativeai as genai
        from content.models import Note, Concept

        note_id = request.data.get('note_id')
        concept_id = request.data.get('concept_id')
        quiz_id = request.data.get('quiz_id')
        num_questions = int(request.data.get('num_questions', 5))

        note = None
        if note_id:
            note = Note.objects.filter(id=note_id).first()
        elif concept_id:
            note = Note.objects.filter(concept_id=concept_id).first()

        if not note:
            return Response({'error': 'Note or Concept not found'}, status=status.HTTP_404_NOT_FOUND)

        api_key = os.getenv('GEMINI_API_KEY', '')
        if not api_key:
            return Response({'error': 'GEMINI_API_KEY not configured on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        prompt = f"""You are an expert technical interviewer and educator.
Create a {num_questions}-question multiple-choice technical quiz based on this lesson note:

TOPIC: {note.title}
DEFINITION: {note.definition}
SYNTAX & CODE: {note.syntax}
{note.code_example}
KEY POINTS & PITFALLS: {note.common_mistakes} {note.important_points}

Generate EXACTLY {num_questions} questions testing conceptual understanding and code behavior.
Output valid JSON array ONLY. No markdown ticks, no commentary. Example format:
[
  {{
    "question": "What happens when...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 1,
    "explanation": "Option B is correct because..."
  }}
]
"""
        generated_data = []
        try:
            genai.configure(api_key=api_key.strip())
            models_to_try = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"]
            response_text = ""
            for m_name in models_to_try:
                try:
                    model = genai.GenerativeModel(m_name)
                    res = model.generate_content(prompt)
                    if res and res.text:
                        response_text = res.text
                        break
                except Exception:
                    continue

            # Clean JSON text
            cleaned = re.sub(r'```(?:json)?', '', response_text).strip()
            generated_data = json.loads(cleaned)
        except Exception as e:
            return Response({'error': f'Failed to generate questions: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # If quiz_id is provided, automatically persist questions to database
        created_questions = []
        if quiz_id:
            quiz = get_object_or_404(Quiz, id=quiz_id)
            current_order = quiz.questions.count() + 1
            for q_item in generated_data:
                question = Question.objects.create(
                    quiz=quiz,
                    question_text=q_item.get('question'),
                    order=current_order,
                    points=1,
                    explanation=q_item.get('explanation', '')
                )
                current_order += 1
                for idx, opt_text in enumerate(q_item.get('options', [])):
                    AnswerOption.objects.create(
                        question=question,
                        option_text=opt_text,
                        is_correct=(idx == q_item.get('correct_index', 0)),
                        order=idx + 1
                    )
                created_questions.append(question.id)

        return Response({
            'success': True,
            'message': f'Generated {len(generated_data)} questions successfully!',
            'questions': generated_data,
            'created_question_ids': created_questions
        }, status=status.HTTP_200_OK)


class BulkImportQuestionsView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        import re
        quiz_id = request.data.get('quiz_id')
        raw_text = request.data.get('raw_text', '')

        if not quiz_id or not raw_text.strip():
            return Response({'error': 'quiz_id and raw_text are required'}, status=status.HTTP_400_BAD_REQUEST)

        quiz = get_object_or_404(Quiz, id=quiz_id)

        # Regex parser for numbered questions
        # Matches patterns like:
        # 1. Question text?
        # A) Option 1
        # B) Option 2
        # C) Option 3
        # D) Option 4
        # Ans: B
        blocks = re.split(r'\n\s*(?=\d+[\.\)])', raw_text.strip())
        created_count = 0
        current_order = quiz.questions.count() + 1

        for block in blocks:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines:
                continue

            # First line is question
            q_line = re.sub(r'^\d+[\.\)]\s*', '', lines[0])
            options = []
            correct_letter = 'A'
            explanation = ''

            for line in lines[1:]:
                # Check for answer tag
                ans_match = re.match(r'^(?:Ans|Answer|Correct)[:\s]+([A-Da-d])', line, re.IGNORECASE)
                if ans_match:
                    correct_letter = ans_match.group(1).upper()
                    continue

                # Check for explanation
                exp_match = re.match(r'^(?:Exp|Explanation)[:\s]+(.*)', line, re.IGNORECASE)
                if exp_match:
                    explanation = exp_match.group(1)
                    continue

                # Check for option
                opt_match = re.match(r'^([A-Da-d])[\.\)]\s*(.*)', line)
                if opt_match:
                    letter = opt_match.group(1).upper()
                    text = opt_match.group(2)
                    options.append((letter, text))

            if q_line and options:
                question = Question.objects.create(
                    quiz=quiz,
                    question_text=q_line,
                    order=current_order,
                    points=1,
                    explanation=explanation
                )
                current_order += 1
                for idx, (letter, text) in enumerate(options):
                    AnswerOption.objects.create(
                        question=question,
                        option_text=text,
                        is_correct=(letter == correct_letter),
                        order=idx + 1
                    )
                created_count += 1

        return Response({
            'success': True,
            'imported_count': created_count,
            'message': f'Imported {created_count} questions into {quiz.title} successfully!'
        }, status=status.HTTP_201_CREATED)
