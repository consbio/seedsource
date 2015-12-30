import logging
import pickle
import socketserver
import struct
from logging.config import dictConfig

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand

try:
    SOCKET_LOGGING = settings.SOCKET_LOGGING
except AttributeError:
    raise ImproperlyConfigured('Missing SOCKET_LOGGING setting')


class LogRecordStreamHandler(socketserver.StreamRequestHandler):
    """
    Handler for streaming logging request. Adapted from
    http://docs.python.org/2/howto/logging-cookbook.html#sending-and-receiving-logging-events-across-a-network
    """

    def handle(self):
        """
        Handle multiple requests - each expected to be a 4-byte length, followed by the LogRecord in pickle format.
        Logs the record according to whatever policy is configured locally.
        """

        while True:
            chunk = self.connection.recv(4)
            if len(chunk) < 4:
                break
            length = struct.unpack('>L', chunk)[0]
            chunk = self.connection.recv(length)
            while len(chunk) < length:
                chunk = chunk + self.connection.recv(length - len(chunk))
            obj = pickle.loads(chunk)
            record = logging.makeLogRecord(obj)
            logger = logging.getLogger(record.name)
            logger.handle(record)


class LogRecordSocketReceiver(socketserver.ThreadingTCPServer):
    """Simple TCP socket-based logging receiver."""

    allow_reuse_address = 1

    def __init__(self, host="localhost", port=logging.handlers.DEFAULT_TCP_LOGGING_PORT,
                 handler=LogRecordStreamHandler):
        socketserver.ThreadingTCPServer.__init__(self, (host, port), handler)
        self.abort = 0
        self.timeout = 1

    def serve_until_stopped(self):
        import select
        abort = 0
        while not abort:
            try:
                rd, wr, ex = select.select([self.socket.fileno()], [], [], self.timeout)
                if rd:
                    self.handle_request()
                abort = self.abort
            except KeyboardInterrupt:
                print('Log server stopped.')
                return


class Command(BaseCommand):
    help = 'Run the logging socket server'

    def handle(self, *args, **options):
        dictConfig(SOCKET_LOGGING)
        logging.Logger.manager = logging.Manager(logging.Logger.root)

        print('Starting log server...')

        server = LogRecordSocketReceiver()
        server.serve_until_stopped()
