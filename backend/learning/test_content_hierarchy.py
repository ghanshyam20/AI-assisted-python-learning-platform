from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Chapter, Lesson, LessonPage, PageBlock


class ContentHierarchyAPITests(TestCase):
    """
    Exercise the real admin API across the complete content hierarchy.

    Tests use an isolated database, so they cannot modify actual
    chapters, lessons, or student progress.
    """

    def setUp(self):
        user_model = get_user_model()

        self.staff = user_model.objects.create_user(
            email="content-manager@example.com",
            password="TestPassword123!",
            is_staff=True,
        )

        self.student = user_model.objects.create_user(
            email="content-student@example.com",
            password="TestPassword123!",
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.staff)

        self.base = "/api/learning/manage/"

    def create_chapter(self):
        response = self.client.post(
            f"{self.base}chapters/",
            {
                "title": "Python Basics",
                "position": 1,
                "published": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data["id"]

    def create_lesson(self, chapter_id):
        response = self.client.post(
            f"{self.base}lessons/",
            {
                "chapter": chapter_id,
                "title": "Introduction to Variables",
                "position": 1,
                "published": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data["id"]

    def test_create_complete_content_hierarchy(self):
        chapter_id = self.create_chapter()
        lesson_id = self.create_lesson(chapter_id)

        page_response = self.client.post(
            f"{self.base}pages/",
            {
                "lesson": lesson_id,
                "title": "What is a variable?",
                "position": 1,
                "published": False,
            },
            format="json",
        )
        self.assertEqual(
            page_response.status_code, 201, page_response.data
        )

        page_id = page_response.data["id"]

        # Blocks are stored independently so editors can reorder
        # content without rewriting the entire lesson.
        for position, block_type, content in [
            (1, "heading", "Python Variables"),
            (2, "paragraph", "Variables store values."),
            (3, "code", 'name = "Alice"\nprint(name)'),
        ]:
            response = self.client.post(
                f"{self.base}blocks/",
                {
                    "page": page_id,
                    "block_type": block_type,
                    "content": content,
                    "position": position,
                },
                format="json",
            )
            self.assertEqual(response.status_code, 201, response.data)

        self.assertEqual(Chapter.objects.count(), 1)
        self.assertEqual(Lesson.objects.count(), 1)
        self.assertEqual(LessonPage.objects.count(), 1)
        self.assertEqual(PageBlock.objects.count(), 3)

        lesson = Lesson.objects.get(id=lesson_id)
        self.assertEqual(lesson.chapter_id, chapter_id)
        self.assertEqual(lesson.pages.count(), 1)

    def test_lesson_slug_is_generated(self):
        chapter_id = self.create_chapter()
        lesson_id = self.create_lesson(chapter_id)

        lesson = Lesson.objects.get(id=lesson_id)

        self.assertEqual(
            lesson.slug, "introduction-to-variables"
        )

    def test_duplicate_lesson_titles_get_unique_slugs(self):
        chapter_id = self.create_chapter()

        first_id = self.create_lesson(chapter_id)
        second_id = self.create_lesson(chapter_id)

        first = Lesson.objects.get(id=first_id)
        second = Lesson.objects.get(id=second_id)

        self.assertNotEqual(first.slug, second.slug)

    def test_student_cannot_create_page(self):
        chapter_id = self.create_chapter()
        lesson_id = self.create_lesson(chapter_id)

        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            f"{self.base}pages/",
            {
                "lesson": lesson_id,
                "title": "Unauthorized Page",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(
            LessonPage.objects.filter(
                title="Unauthorized Page"
            ).exists()
        )

    def test_student_cannot_create_block(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            f"{self.base}blocks/",
            {
                "page": 999,
                "block_type": "paragraph",
                "content": "Unauthorized content",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_invalid_block_type_is_rejected(self):
        chapter_id = self.create_chapter()
        lesson_id = self.create_lesson(chapter_id)

        page = LessonPage.objects.create(
            lesson_id=lesson_id,
            title="Examples",
        )

        response = self.client.post(
            f"{self.base}blocks/",
            {
                "page": page.id,
                "block_type": "unsafe_html",
                "content": "<script>alert(1)</script>",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(PageBlock.objects.count(), 0)


class ContentDeletionSafetyTests(TestCase):
    """Protect authored content from accidental cascading deletion."""

    def setUp(self):
        user_model = get_user_model()
        staff = user_model.objects.create_user(
            email="deletion-manager@example.com",
            password="TestPassword123!",
            is_staff=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=staff)

        self.chapter = Chapter.objects.create(
            title="Python Basics"
        )
        self.lesson = Lesson.objects.create(
            chapter=self.chapter,
            title="Variables",
            slug="variables-deletion-test",
        )
        self.page = LessonPage.objects.create(
            lesson=self.lesson,
            title="Introduction",
        )
        self.block = PageBlock.objects.create(
            page=self.page,
            block_type="paragraph",
            content="A variable stores a value.",
        )

    def test_cannot_delete_chapter_with_lessons(self):
        response = self.client.delete(
            f"/api/learning/manage/chapters/{self.chapter.id}/"
        )
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Chapter.objects.filter(pk=self.chapter.pk).exists())

    def test_cannot_delete_lesson_with_pages(self):
        response = self.client.delete(
            f"/api/learning/manage/lessons/{self.lesson.id}/"
        )
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Lesson.objects.filter(pk=self.lesson.pk).exists())

    def test_cannot_delete_page_with_blocks(self):
        response = self.client.delete(
            f"/api/learning/manage/pages/{self.page.id}/"
        )
        self.assertEqual(response.status_code, 400)
        self.assertTrue(LessonPage.objects.filter(pk=self.page.pk).exists())

    def test_can_delete_individual_block(self):
        response = self.client.delete(
            f"/api/learning/manage/blocks/{self.block.id}/"
        )
        self.assertEqual(response.status_code, 204)
        self.assertFalse(PageBlock.objects.filter(pk=self.block.pk).exists())
