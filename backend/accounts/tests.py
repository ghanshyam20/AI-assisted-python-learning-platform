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


class AuthenticationTests(APITestCase):
    def setUp(self):
        from rest_framework.test import APIClient

        self.client = APIClient(enforce_csrf_checks=True)
        self.password = "StrongPassword123!"

        self.user = User.objects.create_user(
            email="student@example.com",
            password=self.password,
            first_name="Alex",
            last_name="Smith",
        )

        self.login_url = reverse("login")
        self.logout_url = reverse("logout")
        self.me_url = reverse("current-user")
        self.csrf_url = reverse("csrf")

    def get_csrf_token(self):
        response = self.client.get(self.csrf_url)
        self.assertEqual(response.status_code, 200)
        return self.client.cookies["csrftoken"].value

    def login(self):
        token = self.get_csrf_token()
        return self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )

    def test_successful_login(self):
        response = self.login()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertIn("sessionid", self.client.cookies)
        self.assertNotIn("password", response.data)

    def test_invalid_password(self):
        token = self.get_csrf_token()

        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": "WrongPassword123!",
            },
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertNotIn("sessionid", self.client.cookies)

    def test_login_requires_csrf(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_anonymous_user_cannot_access_profile(self):
        response = self.client.get(self.me_url)
        self.assertIn(response.status_code, [401, 403])

    def test_authenticated_user_can_access_profile(self):
        self.login()

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertNotIn("password", response.data)

    def test_logout_ends_session(self):
        self.login()

        token = self.client.cookies["csrftoken"].value

        response = self.client.post(
            self.logout_url,
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )

        self.assertEqual(response.status_code, 200)

        profile_response = self.client.get(self.me_url)
        self.assertIn(profile_response.status_code, [401, 403])

    def test_logout_requires_csrf(self):
        self.login()

        response = self.client.post(
            self.logout_url,
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_registration_requires_csrf(self):
        response = self.client.post(
            reverse("register"),
            {
                "first_name": "New",
                "last_name": "Student",
                "email": "new@example.com",
                "password": "StrongPassword456!",
                "confirm_password": "StrongPassword456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(
            User.objects.filter(email="new@example.com").exists()
        )
