from django.contrib import admin
from .models import (
    Chapter, Lesson, Exercise,
    ExerciseAttempt, StudentProgress,
)


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ("title", "slug", "position", "published")
    show_change_link = True


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ("title", "position", "published")
    list_editable = ("position", "published")
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "chapter", "position", "published")
    list_filter = ("chapter", "published")
    search_fields = ("title", "introduction")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("position", "published")


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = (
        "title", "student", "topic",
        "difficulty", "created_at",
    )
    list_filter = ("topic", "difficulty")
    readonly_fields = ("created_at",)


@admin.register(ExerciseAttempt)
class ExerciseAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "student", "exercise", "passed",
        "xp_awarded", "created_at",
    )


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = (
        "student", "xp", "current_streak",
        "longest_streak", "last_active_date",
    )
