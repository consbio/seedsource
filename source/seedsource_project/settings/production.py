from seedsource_project.settings.base import *

DEBUG = False

ALLOWED_HOSTS = ['seedlotselectiontool.org']

BROKER_URL = 'amqp://{}:{}@localhost:5672'.format(
        CONFIG.get('amqp_username', ''), CONFIG.get('amqp_password', '')
)
CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'

NC_GEOPROCESSING_JOBS_QUEUE = 'gp'

RAVEN_CONFIG = {
    'dsn': CONFIG.get('raven_dsn')
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[%(levelname)s] [%(asctime)s:%(msecs).0f] [%(process)d] %(message)s\n',
            'datefmt': '%Y/%m/%d %H:%M:%S'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': CONFIG.get('logfile_path', '/tmp/seedsource.log'),
            'when': 'midnight',
            'formatter': 'verbose'
        },
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler'
        }
    },
    'loggers': {
        'django.request': {
            'level': 'WARNING',
            'handlers': ['sentry', 'file']
        },
        '': {
            'level': 'DEBUG',
            'handlers': ['sentry', 'file']
        }
    }
}

STATIC_ROOT = '/var/www/static/'

NC_SERVICE_DATA_ROOT = '/ncdjango/services/'
NC_TEMPORARY_FILE_LOCATION = '/ncdjango/tmp/'

# Preview mode
INSTALLED_APPS += ('preview',)

MIDDLEWARE_CLASSES += ('preview.middleware.PreviewAccessMiddleware',)

PREVIEW_MODE = True
PREVIEW_PASSWORD = 'sstearlyaccess'
