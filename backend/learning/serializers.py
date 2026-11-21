from rest_framework import serializers
from .models import Chapter, Lesson


class LessonSerializer(serializers.ModelSerializer):
    chapter_title = serializers.CharField(
        source="chapter.title", read_only=True
    )

    class Meta:
        model = Lesson
        fields = [
            "id",
            "chapter",
            "chapter_title",
            "title",
            "slug",
            "introduction",
            "objectives",
            "explanation",
            "example_code",
            "example_explanation",
            "starter_code",
            "tip_title",
            "tip",
            "tip_example",
            "position",
        ]


class ChapterSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = [
            "id", "title", "description",
            "position", "lessons",
        ]

    def get_lessons(self, chapter):
        lessons = chapter.lessons.filter(published=True)
        return LessonSerializer(lessons, many=True).data
