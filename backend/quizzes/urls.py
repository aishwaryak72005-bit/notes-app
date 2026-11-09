from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuestionViewSet,
    SubmitQuizView,
    QuizAttemptListView,
    GenerateAIQuizView,
    BulkImportQuestionsView,
    PracticeQuestionListView,
    CheckPracticeAnswerView,
)

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')

urlpatterns = [
    path('generate-ai-quiz/', GenerateAIQuizView.as_view(), name='generate_ai_quiz'),
    path('bulk-import/', BulkImportQuestionsView.as_view(), name='bulk_import_questions'),
    path('practice/', PracticeQuestionListView.as_view(), name='practice_questions'),
    path('practice/check/', CheckPracticeAnswerView.as_view(), name='check_practice_answer'),
    path('quizzes/<int:quiz_id>/submit/', SubmitQuizView.as_view(), name='quiz_submit'),
    path('attempts/', QuizAttemptListView.as_view(), name='quiz_attempts'),
    path('', include(router.urls)),
]

