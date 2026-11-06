from django.db import models
from django.conf import settings
from content.models import Concept

class AIConversation(models.Model):
    LEVEL_BEGINNER = 'beginner'
    LEVEL_INTERMEDIATE = 'intermediate'
    LEVEL_ADVANCED = 'advanced'

    LEVEL_CHOICES = [
        (LEVEL_BEGINNER, 'Beginner (Simple English & Analogies)'),
        (LEVEL_INTERMEDIATE, 'Intermediate (Practical & Code Focus)'),
        (LEVEL_ADVANCED, 'Advanced (Deep Architectural & Best Practices)'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_conversations')
    concept = models.ForeignKey(Concept, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_chats')
    title = models.CharField(max_length=200, default='New Learning Session')
    explanation_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default=LEVEL_BEGINNER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student.username} - {self.title} ({self.get_explanation_level_display()})"


class AIMessage(models.Model):
    SENDER_USER = 'user'
    SENDER_AI = 'ai'

    SENDER_CHOICES = [
        (SENDER_USER, 'Student'),
        (SENDER_AI, 'AI Tutor'),
    ]

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.sender.upper()}] {self.content[:40]}..."
