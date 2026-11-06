from rest_framework import serializers
from .models import Bookmark, StudentProgress
from content.models import Concept

class BookmarkSerializer(serializers.ModelSerializer):
    concept_title = serializers.ReadOnlyField(source='concept.title')
    concept_slug = serializers.ReadOnlyField(source='concept.slug')
    module_title = serializers.ReadOnlyField(source='concept.module.title')
    module_slug = serializers.ReadOnlyField(source='concept.module.slug')
    technology_name = serializers.ReadOnlyField(source='concept.module.technology.name')
    technology_slug = serializers.ReadOnlyField(source='concept.module.technology.slug')
    difficulty_level = serializers.ReadOnlyField(source='concept.difficulty_level')
    estimated_minutes = serializers.ReadOnlyField(source='concept.estimated_minutes')

    class Meta:
        model = Bookmark
        fields = (
            'id', 'concept', 'concept_title', 'concept_slug',
            'module_title', 'module_slug', 'technology_name', 'technology_slug',
            'difficulty_level', 'estimated_minutes', 'created_at'
        )


class StudentProgressSerializer(serializers.ModelSerializer):
    concept_title = serializers.ReadOnlyField(source='concept.title')
    technology_name = serializers.ReadOnlyField(source='concept.module.technology.name')

    class Meta:
        model = StudentProgress
        fields = ('id', 'concept', 'concept_title', 'technology_name', 'is_completed', 'completed_at', 'last_accessed_at')
