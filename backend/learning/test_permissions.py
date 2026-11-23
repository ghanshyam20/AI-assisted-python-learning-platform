from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from .permissions import IsContentManager


class ContentManagerPermissionTests(TestCase):
    """
    Ensure only authenticated, active staff members can manage content.

    These tests protect the authorization rule independently of the
    frontend, which cannot be trusted to enforce API permissions.
    """

    def setUp(self):
        self.factory = APIRequestFactory()
        self.permission = IsContentManager()
        self.user_model = get_user_model()

    def test_anonymous_user_is_denied(self):
        request = self.factory.get("/api/learning/manage/")

        # Direct permission tests need an explicit request user.
        from django.contrib.auth.models import AnonymousUser
        request.user = AnonymousUser()

        self.assertFalse(
            self.permission.has_permission(request, None)
        )

    def test_student_is_denied(self):
        student = self.user_model.objects.create_user(
            email="student-permission@example.com",
            password="TestPassword123!",
        )
        request = self.factory.get("/api/learning/manage/")
        request.user = student

        self.assertFalse(
            self.permission.has_permission(request, None)
        )

    def test_staff_user_is_allowed(self):
        staff = self.user_model.objects.create_user(
            email="staff-permission@example.com",
            password="TestPassword123!",
            is_staff=True,
        )
        request = self.factory.get("/api/learning/manage/")
        request.user = staff

        self.assertTrue(
            self.permission.has_permission(request, None)
        )

    def test_inactive_staff_is_denied(self):
        staff = self.user_model.objects.create_user(
            email="inactive-staff@example.com",
            password="TestPassword123!",
            is_staff=True,
            is_active=False,
        )
        request = self.factory.get("/api/learning/manage/")
        request.user = staff

        self.assertFalse(
            self.permission.has_permission(request, None)
        )
