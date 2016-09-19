import os

from clover.render.renderers.stretched import StretchedRenderer
from clover.utilities.color import Color


BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'source')

SECRET_KEY = 'notsosecret'

DEBUG = False

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
                'seedsource_project.context_processors.google_analytics'
            ],
        },
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'seedsource',
        'USER': os.environ.get('POSTGRES_TEST_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_TEST_PASSWORD', ''),
    }
}

STATIC_URL = '/static/'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100
}

NC_REGISTERED_JOBS = {
    'generate_scores': {
        'type': 'task',
        'task': 'seedsource.tasks.generate_scores.GenerateScores',
        'publish_raster_results': True,
        'results_renderer': StretchedRenderer([
            (0, Color(240, 59, 32)),
            (50, Color(254, 178, 76)),
            (100, Color(255, 237, 160))
        ])
    }
}

NC_INSTALLED_INTERFACES = (
    'interfaces.tiles',
)
