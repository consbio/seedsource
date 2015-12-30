import logging

from seedsource_project.settings.base import *

DEBUG = False

ALLOWED_HOSTS = []

BROKER_URL = 'amqp://{}:{}@localhost:5672'.format(
        CONFIG.get('amqp_username', ''), CONFIG.get('amqp_password', '')
)
NC_GEOPROCESSING_JOBS_QUEUE = 'gp'

INSTALLED_APPS += ('socket_logging',)

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
        'socket': {
            'level': 'DEBUG',
            'class': 'logging.handlers.SocketHandler',
            'host': 'localhost',
            'port': logging.handlers.DEFAULT_TCP_LOGGING_PORT
        }
    },
    'loggers': {
        'django.request': {
            'level': 'WARNING',
            'handlers': ['mail_admins', 'socket']
        },
        '': {
            'level': 'DEBUG',
            'handlers': ['mail_admins', 'socket']
        }
    }
}

SOCKET_LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': LOGGING['formatters'],
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': CONFIG.get('logfile_path', '/tmp/seedsource.log'),
            'when': 'midnight',
            'formatter': 'verbose'
        }
    },
    'loggers': {
        '': {
            'handlers': ['file'],
            'level': 'DEBUG'
        }
    }
}

NC_SERVICE_DATA_ROOT = '/ncdjango/services/'
NC_TEMPORARY_FILE_LOCATION = '/ncdjango/tmp/'
