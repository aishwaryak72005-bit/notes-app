from django.db import models
from django.conf import settings
from django.utils.text import slugify

class TechnologyCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, default='layers')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Technology Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Technology(models.Model):
    category = models.ForeignKey(TechnologyCategory, on_delete=models.CASCADE, related_name='technologies')
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon_name = models.CharField(max_length=50, default='code')  # Lucide icon or slug
    badge_color = models.CharField(max_length=30, default='#244C35')
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_technologies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category__order', 'name']
        verbose_name_plural = 'Technologies'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def total_modules(self):
        return self.modules.count()

    @property
    def total_concepts(self):
        return Concept.objects.filter(module__technology=self).count()

    def __str__(self):
        return self.name


class Module(models.Model):
    technology = models.ForeignKey(Technology, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, blank=True)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=1)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_modules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['technology', 'order']
        unique_together = ('technology', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def total_concepts(self):
        return self.concepts.count()

    def __str__(self):
        return f"{self.technology.name} - {self.title}"


class Concept(models.Model):
    DIFFICULTY_BEGINNER = 'beginner'
    DIFFICULTY_INTERMEDIATE = 'intermediate'
    DIFFICULTY_ADVANCED = 'advanced'

    DIFFICULTY_CHOICES = [
        (DIFFICULTY_BEGINNER, 'Beginner'),
        (DIFFICULTY_INTERMEDIATE, 'Intermediate'),
        (DIFFICULTY_ADVANCED, 'Advanced'),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='concepts')
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, blank=True)
    order = models.PositiveIntegerField(default=1)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default=DIFFICULTY_BEGINNER)
    summary = models.TextField(blank=True, null=True)
    estimated_minutes = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['module', 'order']
        unique_together = ('module', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.module.technology.name} > {self.module.title} > {self.title}"


class Note(models.Model):
    concept = models.OneToOneField(Concept, on_delete=models.CASCADE, related_name='note')
    title = models.CharField(max_length=200)
    definition = models.TextField(help_text="Simple, crisp definition of the concept.")
    explanation = models.TextField(help_text="Detailed rich-text or formatted explanation.")
    real_world_analogy = models.TextField(blank=True, null=True, help_text="Intuitive real-world comparison.")
    syntax = models.TextField(blank=True, null=True, help_text="Syntax template / structure.")
    code_example = models.TextField(blank=True, null=True, help_text="Code snippet.")
    code_language = models.CharField(max_length=30, default='python')
    expected_output = models.TextField(blank=True, null=True, help_text="Output produced by the code example.")
    common_mistakes = models.TextField(blank=True, null=True, help_text="Frequent pitfalls and traps.")
    important_points = models.TextField(blank=True, null=True, help_text="Crucial key takeaways or best practices.")
    is_published = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Note: {self.title} ({self.concept.title})"
