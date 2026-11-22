from rest_framework import serializers
from .models import Chapter, Lesson, LessonPage, PageBlock



# Return the content blocks in their saved order.
class PageBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageBlock
        fields = ["id", "block_type", "content", "position"]


class LessonPageSerializer(serializers.ModelSerializer):
    blocks = PageBlockSerializer(many=True, read_only=True)

    class Meta:
        model = LessonPage
        fields = ["id", "title", "position", "blocks"]


class LessonSerializer(serializers.ModelSerializer):
    pages = serializers.SerializerMethodField()

    def get_pages(self, lesson):
        pages = lesson.pages.filter(published=True)
        return LessonPageSerializer(pages, many=True).data

    chapter_title = serializers.CharField(
        source="chapter.title", read_only=True
    )

    class Meta:
        model = Lesson
        fields = [
            "id",
            "chapter",
            "chapter_title",
            "pages",
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
