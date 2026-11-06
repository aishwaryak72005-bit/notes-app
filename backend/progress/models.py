from django.db import models
from django.conf import settings
from content.models import Concept

class StudentProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_records')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='student_progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'concept')
        ordering = ['-last_accessed_at']
        verbose_name_plural = 'Student Progress'

    def __str__(self):
        status = "Completed" if self.is_completed else "In Progress"
        return f"{self.student.username} - {self.concept.title} [{status}]"


class Bookmark(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'concept')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.username} bookmarked {self.concept.title}"
