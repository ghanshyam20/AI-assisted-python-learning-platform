from django.conf import settings
from django.db import models


class Chapter(models.Model):
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=1)
    published = models.BooleanField(default=False)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return self.title


class Lesson(models.Model):
    chapter = models.ForeignKey(
        Chapter, on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    introduction = models.TextField()
    objectives = models.JSONField(default=list)
    explanation = models.TextField()
    example_code = models.TextField()
    example_explanation = models.TextField(blank=True)
    starter_code = models.TextField(blank=True)
    tip_title = models.CharField(max_length=160, blank=True)
    tip = models.TextField(blank=True)
    tip_example = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=1)
    published = models.BooleanField(default=False)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return self.title


class Exercise(models.Model):
    DIFFICULTIES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    lesson = models.ForeignKey(
        Lesson, null=True, blank=True, on_delete=models.SET_NULL
    )
    topic = models.CharField(max_length=100)
    difficulty = models.CharField(
        max_length=20, choices=DIFFICULTIES
    )
    title = models.CharField(max_length=200)
    instructions = models.TextField()
    starter_code = models.TextField(blank=True)
    test_cases = models.JSONField(default=list)
    reference_solution = models.TextField(blank=True)
    hint_level = models.PositiveSmallIntegerField(default=0)
    hints = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ExerciseAttempt(models.Model):
    exercise = models.ForeignKey(
        Exercise, on_delete=models.CASCADE, related_name="attempts"
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    submitted_code = models.TextField()
    passed = models.BooleanField(default=False)
    feedback = models.TextField(blank=True)
    xp_awarded = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class StudentProgress(models.Model):
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learning_progress",
    )
    xp = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    timezone = models.CharField(
        max_length=64, default="Europe/Helsinki"
    )

    def __str__(self):
        return f"{self.student} - {self.xp} XP"


class AIUsage(models.Model):
    STATUSES = [
        ("reserved", "Reserved"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_usage",
    )
    status = models.CharField(
        max_length=12,
        choices=STATUSES,
        default="reserved",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class LessonPage(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="pages",
    )
    title = models.CharField(max_length=160)
    position = models.PositiveIntegerField(default=1)
    published = models.BooleanField(default=False)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class PageBlock(models.Model):
    BLOCK_TYPES = [
        ("heading", "Heading"),
        ("paragraph", "Paragraph"),
        ("bullets", "Bullet list"),
        ("numbered", "Numbered list"),
        ("code", "Python code"),
        ("output", "Example output"),
        ("tip", "Learning tip"),
        ("note", "Important note"),
    ]

    page = models.ForeignKey(
        LessonPage,
        on_delete=models.CASCADE,
        related_name="blocks",
    )
    block_type = models.CharField(
        max_length=20,
        choices=BLOCK_TYPES,
    )
    content = models.TextField()
    position = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return f"{self.get_block_type_display()} - {self.page.title}"
