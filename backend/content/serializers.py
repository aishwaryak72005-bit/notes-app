from rest_framework import serializers
from .models import TechnologyCategory, Technology, Module, Concept, Note

class TechnologyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnologyCategory
        fields = '__all__'


class ConceptShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = ('id', 'title', 'slug', 'order', 'difficulty_level', 'estimated_minutes', 'summary')


class NoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = Note
        fields = (
            'id', 'concept', 'title', 'definition', 'explanation',
            'real_world_analogy', 'syntax', 'code_example', 'code_language',
            'expected_output', 'common_mistakes', 'important_points',
            'interview_questions', 'resource_url',
            'is_published', 'created_by', 'created_by_name', 'created_at', 'updated_at'
        )


class ConceptDetailSerializer(serializers.ModelSerializer):
    note = NoteSerializer(read_only=True)
    module_title = serializers.ReadOnlyField(source='module.title')
    technology_name = serializers.ReadOnlyField(source='module.technology.name')
    technology_slug = serializers.ReadOnlyField(source='module.technology.slug')

    class Meta:
        model = Concept
        fields = (
            'id', 'module', 'module_title', 'technology_name', 'technology_slug',
            'title', 'slug', 'order', 'difficulty_level', 'summary',
            'estimated_minutes', 'note', 'created_at', 'updated_at'
        )


class ModuleSerializer(serializers.ModelSerializer):
    concepts = ConceptShortSerializer(many=True, read_only=True)
    total_concepts = serializers.ReadOnlyField()

    class Meta:
        model = Module
        fields = ('id', 'technology', 'title', 'slug', 'description', 'order', 'concepts', 'total_concepts')


class TechnologySerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    modules = ModuleSerializer(many=True, read_only=True)
    total_modules = serializers.ReadOnlyField()
    total_concepts = serializers.ReadOnlyField()

    class Meta:
        model = Technology
        fields = (
            'id', 'category', 'category_name', 'name', 'slug', 'description',
            'icon_name', 'badge_color', 'is_popular', 'is_active',
            'total_modules', 'total_concepts', 'modules', 'created_at'
        )


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        from .models import Announcement
        model = Announcement
        fields = ('id', 'title', 'message', 'is_active', 'created_by', 'created_by_name', 'created_at', 'updated_at')
