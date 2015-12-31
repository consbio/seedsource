from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist


class IdentityBackend(object):
    """Authenticate a user based on a `User` object (used to manually authenticate a user)"""

    def authenticate(self, user=None):
        return user if isinstance(user, get_user_model()) else None

    def get_user(self, user_id):
        try:
            return get_user_model().objects.get(pk=user_id)
        except ObjectDoesNotExist:
            return None
