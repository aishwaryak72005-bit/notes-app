from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    StudentRegisterView,
    TeacherRegisterView,
    UserProfileView,
    ForgotPasswordView,
    StudentListView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/student/', StudentRegisterView.as_view(), name='register_student'),
    path('register/teacher/', TeacherRegisterView.as_view(), name='register_teacher'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('students/', StudentListView.as_view(), name='student_list'),
]
