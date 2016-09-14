Frontend Structure
==================

The frontend is a single page application built using `React <https://facebook.github.io/react/>`_ and
`Leaflet <http://leafletjs.com/>`_, and mostly written in JavaScript `ES6 <https://babeljs.io/docs/learn-es2015/>`_.

Most of the application logic is contained within the ``assets`` directory. This code is all written in ES6. Some
additional supporting JavaScript (non-ES6) code, as well as CSS documents are located in
``source/seedsource/static/sst``.

All code in ``assetts`` is built using webpack with the output going to ``source/seedsource/static/sst/build/main.js``.

During production deployment, the ``collectstatic`` Django command will copy all static content to a separate location
to be served to the client by Nginx. During the ``collectstatic`` process, all unminified JS code is minified, and
all uncompressed files are gzipped.

.. toctree::
    :maxdepth: 2

    react
