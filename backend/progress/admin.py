from django.contrib import admin
from .models import StudentProgress, Bookmark

@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'concept', 'is_completed', 'completed_at', 'last_accessed_at')
    list_filter = ('is_completed', 'completed_at')
    search_fields = ('student__username', 'concept__title')

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('student', 'concept', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('student__username', 'concept__title')
