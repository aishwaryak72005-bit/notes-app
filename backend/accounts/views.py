from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    StudentRegisterSerializer,
    TeacherRegisterSerializer
)
from .permissions import IsTeacher, IsPlatformAdmin

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class StudentRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = StudentRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        return Response({
            'message': 'Student account created successfully!',
            'user': UserProfileSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class TeacherRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = TeacherRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        return Response({
            'message': 'Teacher account registered successfully!',
            'user': UserProfileSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Please provide a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)
        user_exists = User.objects.filter(email__iexact=email).exists()
        # In a real mail flow, send reset link. Here we confirm instructions sent.
        return Response({
            'message': f'If an account is associated with {email}, password reset instructions have been dispatched.'
        }, status=status.HTTP_200_OK)


class StudentListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        return User.objects.filter(role=User.ROLE_STUDENT).order_by('-date_joined')
