import os
from django.core.exceptions import ImproperlyConfigured

profile = os.environ.get('SEEDSOURCE_DEPLOY_PROFILE')

try:
    from seedsource_project.settings.custom import *
except ImportError:
    if not profile:
        raise ImproperlyConfigured(
            'No deploy profile set. Please set the SEEDSOURCE_DEPLOY_PROFILE environment variable.'
        )
    elif profile == 'production':
        from seedsource_project.settings.production import *
    elif profile == 'local':
        from seedsource_project.settings.local import *
    else:
        raise ImproperlyConfigured('Unrecognized deploy profile: {0}'.format(profile))
