from django.db.models.deletion import ProtectedError
from django.utils.text import slugify
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError

from .models import Chapter, Lesson, LessonPage, PageBlock
from .permissions import IsContentManager


class ManageChapterSerializer(serializers.ModelSerializer):
    """Expose only the fields administrators are allowed to edit."""

    class Meta:
        model = Chapter
        fields = [
            "id", "title", "description", "position", "published",
        ]
        read_only_fields = ["id"]


class ManageLessonSerializer(serializers.ModelSerializer):
    chapter_title = serializers.CharField(
        source="chapter.title", read_only=True
    )

    class Meta:
        model = Lesson
        fields = [
            "id", "chapter", "chapter_title", "title", "slug",
            "introduction", "objectives", "explanation",
            "example_code", "example_explanation", "starter_code",
            "tip_title", "tip", "tip_example", "position", "published",
        ]
        read_only_fields = ["id", "chapter_title"]
        extra_kwargs = {
            # Legacy lesson fields are optional in the new page-based editor.
            # The existing student reader still uses these until migrated.
            "introduction": {"required": False, "allow_blank": True},
            "explanation": {"required": False, "allow_blank": True},
            "example_code": {"required": False, "allow_blank": True},
            "objectives": {"required": False},
            "slug": {"required": False},
        }

    def validate_objectives(self, value):
        if not isinstance(value, list) or not all(
            isinstance(item, str) for item in value
        ):
            raise serializers.ValidationError(
                "Objectives must be a list of strings."
            )
        return value

    def create(self, validated_data):
        # Stable unique slugs preserve existing student lesson URLs.
        # Never regenerate a slug when a lesson title is later edited.
        if not validated_data.get("slug"):
            base = slugify(validated_data["title"]) or "lesson"
            slug = base
            counter = 2

            while Lesson.objects.filter(slug=slug).exists():
                slug = f"{base}-{counter}"
                counter += 1

            validated_data["slug"] = slug

        return super().create(validated_data)


class ManageLessonPageSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(
        source="lesson.title", read_only=True
    )

    class Meta:
        model = LessonPage
        fields = [
            "id", "lesson", "lesson_title",
            "title", "position", "published",
        ]
        read_only_fields = ["id", "lesson_title"]


class ManagePageBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageBlock
        fields = [
            "id", "page", "block_type", "content", "position",
        ]
        read_only_fields = ["id"]


class ContentManagementViewSet(viewsets.ModelViewSet):
    """
    Shared authorization for all administrative content operations.

    Every request must pass Django's active-staff check, regardless
    of which React screen initiated it.
    """

    permission_classes = [IsContentManager]

    def perform_destroy(self, instance):
        """
        Prevent cascading deletion of authored learning content.

        Administrators must remove child content explicitly before
        deleting its parent, avoiding accidental loss of entire lessons.
        """
        protected_relations = {
            Chapter: ("lessons", "lessons"),
            Lesson: ("pages", "pages"),
            LessonPage: ("blocks", "content blocks"),
        }

        for model, (relation, label) in protected_relations.items():
            if isinstance(instance, model):
                if getattr(instance, relation).exists():
                    raise ValidationError({
                        "detail": (
                            f"Cannot delete this item while it contains "
                            f"{label}. Remove them first."
                        )
                    })
                break

        instance.delete()


class ManageChapterViewSet(ContentManagementViewSet):
    serializer_class = ManageChapterSerializer
    queryset = Chapter.objects.all()


class ManageLessonViewSet(ContentManagementViewSet):
    serializer_class = ManageLessonSerializer
    queryset = Lesson.objects.select_related("chapter").all()


class ManageLessonPageViewSet(ContentManagementViewSet):
    serializer_class = ManageLessonPageSerializer
    queryset = LessonPage.objects.select_related("lesson").all()


class ManagePageBlockViewSet(ContentManagementViewSet):
    serializer_class = ManagePageBlockSerializer
    queryset = PageBlock.objects.select_related("page").all()
