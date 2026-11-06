from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TechnologyCategoryViewSet,
    TechnologyViewSet,
    ModuleViewSet,
    ConceptViewSet,
    NoteViewSet,
    StudentDashboardView,
    TeacherDashboardView,
)

router = DefaultRouter()
router.register(r'categories', TechnologyCategoryViewSet, basename='category')
router.register(r'technologies', TechnologyViewSet, basename='technology')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'concepts', ConceptViewSet, basename='concept')
router.register(r'notes', NoteViewSet, basename='note')

urlpatterns = [
    path('dashboard/student/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('dashboard/teacher/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('', include(router.urls)),
]
