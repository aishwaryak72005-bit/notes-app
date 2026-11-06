from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuestionViewSet,
    SubmitQuizView,
    QuizAttemptListView,
)

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')

urlpatterns = [
    path('quizzes/<int:quiz_id>/submit/', SubmitQuizView.as_view(), name='quiz_submit'),
    path('attempts/', QuizAttemptListView.as_view(), name='quiz_attempts'),
    path('', include(router.urls)),
]
