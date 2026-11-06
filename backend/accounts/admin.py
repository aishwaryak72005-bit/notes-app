from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_approved_teacher', 'is_staff', 'created_at')
    list_filter = ('role', 'is_approved_teacher', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('TechNotes Custom Fields', {'fields': ('role', 'bio', 'avatar', 'is_approved_teacher')}),
    )
