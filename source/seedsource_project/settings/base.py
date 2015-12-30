import json
import os


# Starting at this file, walk back up the directory tree to the project root
import random
import string

from clover.render.renderers.stretched import StretchedRenderer
from clover.utilities.color import Color

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

    'ncdjango',
    'rest_framework',
    'tastypie',
    'djcelery',

    'seedsource'
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
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': CONFIG.get('db_name', 'seedsource'),
        'USER': CONFIG.get('db_user', 'seedsource'),
        'PASSWORD': CONFIG.get('db_password'),
        'HOST': CONFIG.get('db_host', '127.0.0.1')
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'

CELERY_TRACK_STARTED = True

NC_REGISTERED_JOBS = {
    'generate_scores': {
        'type': 'workflow',
        'path': os.path.join(BASE_DIR, 'seedsource', 'workflows', 'generate_scores_workflow.json'),
        'publish_raster_results': True,
        'results_renderer': StretchedRenderer([(0, Color(0, 255, 0)), (100, Color(255, 0, 0))])
    }
}
