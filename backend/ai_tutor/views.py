from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import AIConversation, AIMessage
from .gemini_service import generate_gemini_response
from content.models import Concept

class ConversationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        convs = AIConversation.objects.filter(student=request.user).order_by('-updated_at')
        data = [
            {
                'id': c.id,
                'title': c.title,
                'concept_id': c.concept_id,
                'concept_title': c.concept.title if c.concept else None,
                'explanation_level': c.explanation_level,
                'message_count': c.messages.count(),
                'updated_at': c.updated_at.strftime('%Y-%m-%d %H:%M'),
            }
            for c in convs
        ]
        return Response(data)

    def post(self, request):
        concept_id = request.data.get('concept_id')
        level = request.data.get('explanation_level', 'beginner')
        concept = None
        title = "General Learning Assistance"

        if concept_id:
            concept = Concept.objects.filter(id=concept_id).first()
            if concept:
                title = f"Learning: {concept.title}"

        conv = AIConversation.objects.create(
            student=request.user,
            concept=concept,
            title=title,
            explanation_level=level
        )

        # Seed initial greeting from AI Tutor
        greeting_text = f"Hello {request.user.first_name or 'there'}! 👋 I am your SyntaxHawk AI Learning Assistant. "
        if concept:
            greeting_text += f"We are currently exploring **{concept.title}** ({concept.module.technology.name}). How can I help you understand this concept better today?"
        else:
            greeting_text += "What technology or concept would you like to explore today?"

        AIMessage.objects.create(
            conversation=conv,
            sender='ai',
            content=greeting_text
        )

        return Response({
            'id': conv.id,
            'title': conv.title,
            'explanation_level': conv.explanation_level,
            'concept_id': conv.concept_id,
        }, status=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        conv = get_object_or_404(AIConversation, id=pk, student=request.user)
        messages = conv.messages.all().order_by('created_at')
        return Response({
            'id': conv.id,
            'title': conv.title,
            'explanation_level': conv.explanation_level,
            'concept_id': conv.concept_id,
            'concept_title': conv.concept.title if conv.concept else None,
            'technology_name': conv.concept.module.technology.name if conv.concept else None,
            'messages': [
                {
                    'id': m.id,
                    'sender': m.sender,
                    'content': m.content,
                    'created_at': m.created_at.strftime('%H:%M'),
                }
                for m in messages
            ]
        })

    def delete(self, request, pk):
        conv = get_object_or_404(AIConversation, id=pk, student=request.user)
        conv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        conv = get_object_or_404(AIConversation, id=pk, student=request.user)
        content = request.data.get('content', '').strip()
        explanation_level = request.data.get('explanation_level')

        if not content:
            return Response({'error': 'Message content cannot be blank.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update explanation level if provided
        if explanation_level and explanation_level in ['beginner', 'intermediate', 'advanced']:
            conv.explanation_level = explanation_level
            conv.save()

        # Save user message
        user_msg = AIMessage.objects.create(
            conversation=conv,
            sender='user',
            content=content
        )

        # Invoke adaptive AI Tutor engine
        ai_reply_text = generate_gemini_response(conv, content, conv.concept)

        # Save AI Tutor response
        ai_msg = AIMessage.objects.create(
            conversation=conv,
            sender='ai',
            content=ai_reply_text
        )

        conv.save()  # update updated_at

        return Response({
            'user_message': {
                'id': user_msg.id,
                'sender': user_msg.sender,
                'content': user_msg.content,
                'created_at': user_msg.created_at.strftime('%H:%M'),
            },
            'ai_message': {
                'id': ai_msg.id,
                'sender': ai_msg.sender,
                'content': ai_msg.content,
                'created_at': ai_msg.created_at.strftime('%H:%M'),
            },
            'current_level': conv.explanation_level,
        }, status=status.HTTP_200_OK)


class UpdateConversationLevelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        conv = get_object_or_404(AIConversation, id=pk, student=request.user)
        level = request.data.get('explanation_level')
        if level in ['beginner', 'intermediate', 'advanced']:
            conv.explanation_level = level
            conv.save()
            return Response({'status': 'updated', 'explanation_level': level})
        return Response({'error': 'Invalid explanation level'}, status=status.HTTP_400_BAD_REQUEST)


class StudentDoubtRadarView(APIView):
    from accounts.permissions import IsTeacher
    permission_classes = [IsTeacher]

    def get(self, request):
        from django.db.models import Count
        # Top concepts students are asking about
        top_concepts = (
            AIConversation.objects.filter(concept__isnull=False)
            .values('concept__id', 'concept__title', 'concept__module__technology__name')
            .annotate(query_count=Count('messages'))
            .order_by('-query_count')[:8]
        )

        # Recent user questions
        recent_queries = (
            AIMessage.objects.filter(sender='user')
            .select_related('conversation', 'conversation__concept', 'conversation__student')
            .order_by('-created_at')[:10]
        )
        queries_data = [
            {
                'id': m.id,
                'content': m.content,
                'student_name': m.conversation.student.get_full_name() or m.conversation.student.username,
                'concept_title': m.conversation.concept.title if m.conversation.concept else 'General Concept',
                'created_at': m.created_at.strftime('%Y-%m-%d %H:%M'),
            }
            for m in recent_queries
        ]

        return Response({
            'top_concepts': list(top_concepts),
            'recent_queries': queries_data
        })

