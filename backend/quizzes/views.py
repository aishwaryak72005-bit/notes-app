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
