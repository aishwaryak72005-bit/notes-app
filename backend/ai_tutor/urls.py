from django.urls import path
from .views import (
    ConversationListCreateView,
    ConversationDetailView,
    SendMessageView,
    UpdateConversationLevelView,
    StudentDoubtRadarView,
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='ai_conversations'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='ai_conversation_detail'),
    path('conversations/<int:pk>/send/', SendMessageView.as_view(), name='ai_send_message'),
    path('conversations/<int:pk>/level/', UpdateConversationLevelView.as_view(), name='ai_update_level'),
    path('doubt-radar/', StudentDoubtRadarView.as_view(), name='doubt_radar'),
]

