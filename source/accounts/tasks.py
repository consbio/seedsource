from datetime import timedelta

from celery.task import task
from django.conf import settings
from django.utils.timezone import now

from accounts.models import PasswordResetToken

PASSWORD_RESET_TOKEN_EXPIRATION = getattr(settings, 'PASSWORD_RESET_TOKEN_EXPIRATION', 43200)  # 12 hours


@task
def cleanup_password_reset_tokens():
    """ Remove expired tokens """

    cutoff = now() - timedelta(seconds=PASSWORD_RESET_TOKEN_EXPIRATION)

    PasswordResetToken.objects.filter(created__lt=cutoff).delete()
