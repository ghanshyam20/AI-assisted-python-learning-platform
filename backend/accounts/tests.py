from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegistrationTests(APITestCase):
    def setUp(self):
        self.url = reverse("register")
        self.data = {
            "first_name": "Alex",
            "last_name": "Smith",
            "email": "alex@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
        }

    def test_successful_registration(self):
        response = self.client.post(self.url, self.data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)

        user = User.objects.get(email="alex@example.com")
        self.assertTrue(user.check_password(self.data["password"]))
        self.assertEqual(user.first_name, "Alex")
        self.assertNotIn("password", response.data)
        self.assertNotIn("confirm_password", response.data)

    def test_duplicate_email_rejected(self):
        User.objects.create_user(
            email="alex@example.com",
            password="ExistingPassword123!",
        )

        response = self.client.post(self.url, self.data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_password_mismatch_rejected(self):
        self.data["confirm_password"] = "DifferentPassword123!"

        response = self.client.post(self.url, self.data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

    def test_weak_password_rejected(self):
        self.data["password"] = "123"
        self.data["confirm_password"] = "123"

        response = self.client.post(self.url, self.data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)
