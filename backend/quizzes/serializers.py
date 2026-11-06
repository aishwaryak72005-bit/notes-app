from rest_framework import serializers
from .models import Quiz, Question, AnswerOption, QuizAttempt, StudentAnswer

class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ('id', 'option_text', 'order')


class AnswerOptionTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ('id', 'option_text', 'is_correct', 'order')


class QuestionSerializer(serializers.ModelSerializer):
    options = AnswerOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'question_type', 'question_text', 'code_snippet', 'points', 'order', 'options')


class QuestionDetailSerializer(serializers.ModelSerializer):
    options = AnswerOptionTeacherSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'quiz', 'question_type', 'question_text', 'code_snippet', 'explanation', 'points', 'order', 'options')


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    total_questions = serializers.ReadOnlyField()
    concept_title = serializers.ReadOnlyField(source='concept.title')

    class Meta:
        model = Quiz
        fields = (
            'id', 'title', 'description', 'concept', 'concept_title', 'module',
            'time_limit_minutes', 'passing_score_percentage', 'difficulty_level',
            'is_published', 'total_questions', 'questions'
        )


class StudentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source='question.question_text')
    explanation = serializers.ReadOnlyField(source='question.explanation')

    class Meta:
        model = StudentAnswer
        fields = ('id', 'question', 'question_text', 'selected_option', 'text_answer', 'is_correct', 'explanation')


class QuizAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.get_full_name')
    quiz_title = serializers.ReadOnlyField(source='quiz.title')
    student_answers = StudentAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = (
            'id', 'student', 'student_name', 'quiz', 'quiz_title',
            'score_percentage', 'total_questions', 'correct_answers',
            'incorrect_answers', 'passed', 'time_taken_seconds',
            'completed_at', 'student_answers'
        )
