from rest_framework.permissions import BasePermission


class IsContentManager(BasePermission):
    """
    Allow content management only for active Django staff users.

    Frontend route protection improves navigation, but every API request
    must independently enforce authorization on the server.
    """

    message = "You do not have permission to manage learning content."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.is_staff
        )
