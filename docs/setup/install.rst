Install & Project Setup
=======================

Requirements
------------

Python Requirements
^^^^^^^^^^^^^^^^^^^

* Python 3.5+ (https://www.python.org/)
* Django 1.8 (https://www.djangoproject.com/)
* ``ncdjango`` 0.4.0 (http://ncdjango.readthedocs.io/)
* ``clover`` 0.2.0 (https://github.com/consbio/clover)
* ``amqp``
* ``celery``
* ``django-celery``
* ``djangorestframework``
* ``Fiona``
* ``kombu``
* ``mercantile``
* ``ncdjango==0.4.0``
* ``netCDF4``
* ``numpy``
* ``Pillow``
* ``psycopg2``
* ``pyproj``
* ``pytest``
* ``pytest-django``
* ``rasterio``
* ``Shapely``
* ``django-filter``
* ``aiohttp``
* ``geopy``
* ``raven``
* ``WeasyPrint``
* ``gunicorn``

Other Requirements
^^^^^^^^^^^^^^^^^^

* PostgreSQL (https://www.postgresql.org/)
* PostGIS (http://postgis.net/)
* NodeJS (https://nodejs.org/en/)
* Nginx (https://nginx.org/en/)
* Supervisor (http://supervisord.org/)
* RabbitMQ (https://www.rabbitmq.com/)
* UglifyJS (https://github.com/mishoo/UglifyJS)
* Babel (https://babeljs.io/)

Installation
------------

This document covers installing the application stack on Linux using Nginx for a webserver proxy and Gunicorn for a
WSGI server. You can certainly use other software to fill these needs.

It's a good idea to be familiar with deploying Django in a production environment:
https://docs.djangoproject.com/en/1.8/howto/deployment/wsgi/

.. note::

    These instructions cover deployment to a production environment. Setup for a develop environment will be similar
    but have have some differences depending on platform, and may not require certain dependencies such as Nginx,
    Gunicorn, and Supervisor.

Install Dependencies
^^^^^^^^^^^^^^^^^^^^

Install the Python 3.5 and the non-Python dependencies first. Then install ``numpy`` followed by ``GDAL``, ``rasterio``
and then ``clover`` (see https://github.com/consbio/clover). After that, the remainder of the Python requirements
should be install fairly easily, though you may need to install a few development libraries first (e.g., for psycopg).

.. note::

    It's recommended tthat you not use the root account to run your application or web server. Instead, use one account
    for nginx (if you install nginx through a package managet, this should be done automatically) and another account
    for the application itself (e.g., ``seedsource``). It's also recommended to create a Python `virtual environment
    <https://virtualenv.pypa.io/en/stable/>`_ as the application user and use it to install all Python dependencies and
    run all Python commands.

.. note::

    ``GDAL`` will probably be the most challenging dependency to get installed. You may need to have the GDAL
    development libraries installed first, and if you get stuck, search for installing GDAL Python for your platform.
    Once GDAL is installed, everything else should be eaiser.

.. note::

    There is a ``clover`` package on PyPI. This is *not* the clover you need to install. Make sure to install clover
    from the repository: https://github.com/consbio/clover

Install Project
^^^^^^^^^^^^^^^

Choose a location for the project directory (e.g., ``/home/seedsource/apps/``). Navigate to the directory, and clone the
repository:

.. code-block:: text

    $ git checkout https://github.com/consbio/seedsource.git

Setup & Configuration
---------------------

Make sure PostgreSQL (+PostGIS), Nginx, Supervisor, and RabbitMQ are installed, running, and configured to start at
launch. Create a spatially-enabled database, and a database user for the application (e.g., ``seedsource``).

Configure Django
^^^^^^^^^^^^^^^^

Create a file in ``seedsource/source`` directory called ``config.json``. Add the following to this file, and fill out
the values:

.. code-block:: json

    {
      "amqp_username": "",
      "amqp_password": "",
      "django_secret_key": "",
      "db_password": ""
    }

You can also add the following optional keys to your ``config.json``:

.. code-block:: json

    {
        "raven_dsn": "",
        "logfile_path": "",
        "db_name": "",
        "db_user": "",
        "db_host": ""
    }

Create a new Python module in ``seedsource/source/seedsource_project/settings`` called ``custom.py``. Add the following
to this new file:

.. code-block:: python

    ALLOWED_HOSTS = []  # Add your host name or names here. E.g., 'seedlotselectiontool.org'

.. note::

    You can also add additional settings to ``custom.py`` or override settings specified in ``production.py`` and
    ``base.py`` as needed.

Run the database migrations:

.. code-block:: text

    $ python manage.py migrate

Configure Supervisor
^^^^^^^^^^^^^^^^^^^^

If you don't have a supervisor configuration file already, create one with:

.. code-block:: text

    $ echo_supervisord_conf > /etc/supervisord.conf

Edit ``/etc/supervisord.conf`` and add programs for gunicorn, celery, and celery beat, filling in the paths as needed:

.. code-block:: ini

    [program:gunicorn]
    user=seedsource
    directory=/path/to/seedsource/source
    command=/path/to/bin/gunicorn --bind=127.0.0.1:8000 --pid=/path/to/gunicorn.pid --error-logfile=/path/to/error.log --timeout=180 --graceful-timeout=180 --workers=4 seedsource_project.wsgi:application
    autorestart=true

    [program:django-celery-worker]
    user=seedsource
    directory=/path/to/seedsource/source
    command=/path/to/bin/celery -A seedsource_project worker --loglevel=info --concurrency=1

    [program:django-celerybeat-worker]
    user=seedsource
    directory=/path/to/seedsource/source
    command=/path/to/bin/celery -A seedsource_project beat --loglevel=info

Restart the supervisord process.

Configure Nginx
^^^^^^^^^^^^^^^

Edit your nginx configuration and add a location directive for the seedsource application, and another location
directive for your static files:

.. code-block:: nginx

    location / {
        proxy_set_header Host $http_host;
        proxy_pass http://app_server;
    }

    location /static/ {
        alias /var/www/static/;
    }

.. note::

    If you want to store the static files in another location, you will also need to override the ``STATIC_ROOT``
    setting in ``custom.py``.

Restart or reload nginx.

Build & Deploy Static Content
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Navigate to the ``seedsource`` root directory, install the npm dependencies, and run the build script:

.. code-block:: text

    $ npm install
    $ npm run-script webpack_production

One this completes, navigate to the ``source`` folder and run the ``collectstatic`` manage command:

.. code-block:: text

    $ python manage.py collectstatic

You should now be able to access the tool at ``http://<your-server>/sst/``. Of course, for it to be useful, you will need
data. This is covered in the :ref:`setup-add-data` document.
