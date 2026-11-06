from django.contrib import admin
from .models import TechnologyCategory, Technology, Module, Concept, Note

@admin.register(TechnologyCategory)
class TechnologyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_popular', 'is_active', 'total_modules', 'total_concepts')
    list_filter = ('category', 'is_popular', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'technology', 'order', 'total_concepts')
    list_filter = ('technology',)
    search_fields = ('title', 'description')

@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'difficulty_level', 'order', 'estimated_minutes')
    list_filter = ('difficulty_level', 'module__technology')
    search_fields = ('title', 'summary')

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'concept', 'code_language', 'is_published', 'updated_at')
    list_filter = ('code_language', 'is_published')
    search_fields = ('title', 'definition', 'explanation')
