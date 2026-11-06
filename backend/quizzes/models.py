from django.db import models
from django.conf import settings
from content.models import Concept, Module

class Quiz(models.Model):
    DIFFICULTY_BEGINNER = 'beginner'
    DIFFICULTY_INTERMEDIATE = 'intermediate'
    DIFFICULTY_ADVANCED = 'advanced'

    DIFFICULTY_CHOICES = [
        (DIFFICULTY_BEGINNER, 'Beginner'),
        (DIFFICULTY_INTERMEDIATE, 'Intermediate'),
        (DIFFICULTY_ADVANCED, 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='quizzes', null=True, blank=True)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quizzes', null=True, blank=True)
    time_limit_minutes = models.PositiveIntegerField(default=10)
    passing_score_percentage = models.PositiveIntegerField(default=70)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default=DIFFICULTY_BEGINNER)
    is_published = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_quizzes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Quizzes'

    @property
    def total_questions(self):
        return self.questions.count()

    def __str__(self):
        target = self.concept.title if self.concept else (self.module.title if self.module else "General")
        return f"Quiz: {self.title} ({target})"


class Question(models.Model):
    TYPE_MCQ = 'mcq'
    TYPE_TRUE_FALSE = 'true_false'
    TYPE_PREDICT_OUTPUT = 'predict_output'
    TYPE_FIND_ERROR = 'find_error'
    TYPE_FILL_BLANK = 'fill_blank'

    QUESTION_TYPE_CHOICES = [
        (TYPE_MCQ, 'Multiple Choice Questions'),
        (TYPE_TRUE_FALSE, 'True or False'),
        (TYPE_PREDICT_OUTPUT, 'Predict the Output'),
        (TYPE_FIND_ERROR, 'Find the Error'),
        (TYPE_FILL_BLANK, 'Fill in the Blanks'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=30, choices=QUESTION_TYPE_CHOICES, default=TYPE_MCQ)
    question_text = models.TextField()
    code_snippet = models.TextField(blank=True, null=True)
    explanation = models.TextField(help_text="Detailed explanation of the correct answer.")
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['quiz', 'order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."


class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=300)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['question', 'order']

    def __str__(self):
        mark = "✓" if self.is_correct else "✗"
        return f"{mark} {self.option_text}"


class QuizAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score_percentage = models.FloatField(default=0.0)
    total_questions = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    incorrect_answers = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title} ({self.score_percentage:.1f}%)"


class StudentAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='student_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(AnswerOption, on_delete=models.SET_NULL, null=True, blank=True)
    text_answer = models.CharField(max_length=255, blank=True, null=True)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        status = "Correct" if self.is_correct else "Incorrect"
        return f"Attempt #{self.attempt_id} Q#{self.question_id}: {status}"
