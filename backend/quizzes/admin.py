from django.contrib import admin
from .models import Quiz, Question, AnswerOption, QuizAttempt, StudentAnswer

class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 4

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz', 'question_type', 'points', 'order')
    list_filter = ('question_type', 'quiz')
    search_fields = ('question_text', 'explanation')
    inlines = [AnswerOptionInline]

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'concept', 'module', 'difficulty_level', 'passing_score_percentage', 'is_published')
    list_filter = ('difficulty_level', 'is_published')
    search_fields = ('title', 'description')
    inlines = [QuestionInline]

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score_percentage', 'passed', 'completed_at')
    list_filter = ('passed', 'completed_at')
    search_fields = ('student__username', 'quiz__title')

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'selected_option', 'is_correct')
    list_filter = ('is_correct',)
