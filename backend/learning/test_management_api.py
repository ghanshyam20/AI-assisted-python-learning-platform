from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Chapter


class ChapterManagementAPITests(TestCase):
    """Test real HTTP authorization and chapter persistence."""

    def setUp(self):
        user_model = get_user_model()

        self.student = user_model.objects.create_user(
            email="student-api@example.com",
            password="TestPassword123!",
        )
        self.staff = user_model.objects.create_user(
            email="staff-api@example.com",
            password="TestPassword123!",
            is_staff=True,
        )
        self.client = APIClient()
        self.url = "/api/learning/manage/chapters/"

    def test_anonymous_cannot_list_chapters(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [401, 403])

    def test_student_cannot_create_chapter(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            self.url,
            {"title": "Python Basics"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Chapter.objects.count(), 0)

    def test_staff_can_create_chapter(self):
        self.client.force_authenticate(user=self.staff)

        response = self.client.post(
            self.url,
            {
                "title": "Python Basics",
                "description": "Learn Python fundamentals.",
                "position": 1,
                "published": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            Chapter.objects.filter(
                title="Python Basics",
                published=False,
            ).exists()
        )

    def test_staff_can_update_chapter(self):
        chapter = Chapter.objects.create(title="Python Basics")
        self.client.force_authenticate(user=self.staff)

        response = self.client.patch(
            f"{self.url}{chapter.id}/",
            {"published": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        chapter.refresh_from_db()
        self.assertTrue(chapter.published)

    def test_staff_can_delete_chapter(self):
        chapter = Chapter.objects.create(title="Temporary")
        self.client.force_authenticate(user=self.staff)

        response = self.client.delete(f"{self.url}{chapter.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Chapter.objects.filter(id=chapter.id).exists())
