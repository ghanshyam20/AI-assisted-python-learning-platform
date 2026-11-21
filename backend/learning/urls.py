from django.urls import path
from .views import ChapterListView, LessonDetailView

urlpatterns = [
    path("chapters/", ChapterListView.as_view(), name="chapters"),
    path(
        "lessons/<slug:slug>/",
        LessonDetailView.as_view(),
        name="lesson-detail",
    ),
]
