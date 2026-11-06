from django.contrib import admin
from .models import AIConversation, AIMessage

class AIMessageInline(admin.TabularInline):
    model = AIMessage
    extra = 0
    readonly_fields = ('created_at',)

@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('title', 'student', 'concept', 'explanation_level', 'updated_at')
    list_filter = ('explanation_level', 'updated_at')
    search_fields = ('title', 'student__username')
    inlines = [AIMessageInline]

@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'created_at')
    list_filter = ('sender', 'created_at')
