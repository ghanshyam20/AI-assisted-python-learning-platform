from .exercise_views import GenerateExerciseView, ExerciseHintView
from django.urls import path
from .views import ChapterListView, LessonDetailView

urlpatterns = [
    path("exercises/<int:exercise_id>/hint/", ExerciseHintView.as_view(), name="exercise-hint"),
    path("exercises/generate/", GenerateExerciseView.as_view(), name="generate-exercise"),
    path("chapters/", ChapterListView.as_view(), name="chapters"),
    path(
        "lessons/<slug:slug>/",
        LessonDetailView.as_view(),
        name="lesson-detail",
    ),
]
