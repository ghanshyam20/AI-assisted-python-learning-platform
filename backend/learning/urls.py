from .lesson_ai_views import LessonAIView
from .exercise_views import GenerateExerciseView, ExerciseHintView
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .management_api import (
    ManageChapterViewSet,
    ManageLessonViewSet,
    ManageLessonPageViewSet,
    ManagePageBlockViewSet,
)
from .views import ChapterListView, LessonDetailView

urlpatterns = [
    path("lessons/<slug:slug>/ai/", LessonAIView.as_view(), name="lesson-ai"),
    path("exercises/<int:exercise_id>/hint/", ExerciseHintView.as_view(), name="exercise-hint"),
    path("exercises/generate/", GenerateExerciseView.as_view(), name="generate-exercise"),
    path("chapters/", ChapterListView.as_view(), name="chapters"),
    path(
        "lessons/<slug:slug>/",
        LessonDetailView.as_view(),
        name="lesson-detail",
    ),
]


# Keep content-management routes separate from student learning endpoints.
# Every registered viewset independently enforces staff authorization.
management_router = DefaultRouter()
management_router.register(
    "chapters", ManageChapterViewSet, basename="manage-chapters"
)
management_router.register(
    "lessons", ManageLessonViewSet, basename="manage-lessons"
)
management_router.register(
    "pages", ManageLessonPageViewSet, basename="manage-pages"
)
management_router.register(
    "blocks", ManagePageBlockViewSet, basename="manage-blocks"
)

urlpatterns += [
    path("manage/", include(management_router.urls)),
]
