from seedsource_project.settings.base import *

INSTALLED_APPS += ('kombu.transport.django',)

BROKER_URL = 'django://'
CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'

BABEL_CMD = 'babel'
UGLIFY_CMD = 'uglifyjs'
