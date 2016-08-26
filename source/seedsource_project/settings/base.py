import json
import os

import random
import string
from datetime import timedelta

from clover.render.renderers.stretched import StretchedRenderer
from clover.utilities.color import Color


# Starting at this file, walk back up the directory tree to the project root
BASE_DIR = os.path.abspath(__file__)
for __ in range(3):
    BASE_DIR = os.path.dirname(BASE_DIR)

CONFIG = {}
config_file = os.environ.get('SEEDSOURCE_CONF_FILE') or os.path.join(BASE_DIR, 'config.json')
if config_file and os.path.isfile(config_file):
    with open(config_file) as f:
        CONFIG = json.loads(f.read())

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = CONFIG.get(
        'django_secret_key', ''.join(
                [random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(50)]
        ))  # This results in a random secret key every time the settings are loaded. Not appropriate for production.

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',

    'ncdjango',
    'rest_framework',
    'tastypie',
    'djcelery',
    'webpack_loader',

    'seedsource',
    'accounts'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'seedsource_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'seedsource_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': CONFIG.get('db_name', 'seedsource'),
        'USER': CONFIG.get('db_user', 'seedsource'),
        'PASSWORD': CONFIG.get('db_password'),
        'HOST': CONFIG.get('db_host', '127.0.0.1')
    }
}

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'accounts.backends.IdentityBackend'
)

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100
}

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_STORAGE = 'seedsource_project.storage.SSTStaticFilesStorage'
BABEL_CMD = '/usr/local/bin/babel'
UGLIFY_CMD = '/usr/local/bin/uglifyjs'

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'sst/build/',
        'STATS_FILE': os.path.join(BASE_DIR, '..', 'webpack-stats.json')
    }
}

CELERY_TRACK_STARTED = True
CELERYBEAT_SCHEDULE = {
    'cleanup_temporary_services': {
        'task': 'ncdjango.geoprocessing.celery_tasks.cleanup_temporary_services',
        'schedule': timedelta(hours=1),
        'options': {
            'expires': 7200  # 2 hrs
        }
    }
}

NC_REGISTERED_JOBS = {
    'generate_scores': {
        'type': 'workflow',
        'path': os.path.join(BASE_DIR, 'seedsource', 'workflows', 'generate_scores_workflow.json'),
        'publish_raster_results': True,
        'results_renderer': StretchedRenderer([
            (0, Color(240, 59, 32)),
            (50, Color(254, 178, 76)),
            (100, Color(255, 237, 160))
        ])
    }
}

NC_INSTALLED_INTERFACES = (
    'ncdjango.interfaces.data',
    'ncdjango.interfaces.arcgis_extended',
    'ncdjango.interfaces.arcgis',
    'interfaces.tiles'
)

NC_ENABLE_STRIDING = True
