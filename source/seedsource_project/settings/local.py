from seedsource_project.settings.base import *

INSTALLED_APPS += ('kombu.transport.django',)

INTERNAL_IPS = ['127.0.0.1']

BROKER_URL = 'django://'
CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'

BABEL_CMD = 'babel'
UGLIFY_CMD = 'uglifyjs'
