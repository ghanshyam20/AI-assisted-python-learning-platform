from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Chapter, Lesson
from .serializers import ChapterSerializer, LessonSerializer


class ChapterListView(generics.ListAPIView):
    serializer_class = ChapterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chapter.objects.filter(
            published=True
        ).prefetch_related("lessons")


class LessonDetailView(generics.RetrieveAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"

    def get_queryset(self):
        return Lesson.objects.filter(
            published=True,
            chapter__published=True,
        ).select_related("chapter")
