React Application
=================

Most of the user interface is driven by a React application, the code for which is located in ``assets``.

.. note::

    This document assumes familiarity with basic React and Redux concepts. If you are not familiar with these
    frameworks, some good places to start are
    `Thinking in React <https://facebook.github.io/react/docs/thinking-in-react.html>`_ and
    `Redux Basics <http://redux.js.org/docs/basics/>`_.

Overview
--------

The application is structured as follows:

.. code-block:: text

    assets/
    |-- actions/ (Redux actions)
    |-- async/ (async calls based on state changes)
    |-- components/ (React components (rendering logic only)
    |-- containers/ (state logic and event handling for components)
    |-- reducers/ (Redux reducers)
    |-- config.js (variables and species configurations, unit conversions, etc.)
    |-- index.jsx (entry point)
    |-- io.js (async utils)
    |-- resync.js (utility to manage async calls based on state changes)
    |-- utils.js (general utility functions)

Application State
-----------------

The application state is composed of the following attributes:

* ``isLoggedIn`` (single value indicating whether the current user is logged in)
* ``activeTab`` (single value indicating the currently selected navigation tab)
* ``activeVariable`` (single value with the name of the variable currently displayed in the map)
* ``activeStep`` (single value indicating the currently selected configuration step)
* ``runConfiguration`` (object representing the current state of configuration options)
* ``lastRun`` (object representing the configuration options from the last successful run)
* ``map`` (object representing the state of various map componenets)
* ``job`` (object representing the state of an in-progress job)
* ``saves`` (object containing saved runs)
* ``legends`` (object containing variable and result legend information)
* ``pdfIsFetching`` (single value indicating whether a request for a PDF report is pending)
* ``error`` (object containing information about the most recent error)
* ``popup`` (object representing the state of the map popup and data shown within)

React Components
----------------

React components are split into two parts: the component itself, which only handles logic necessary to rendering the
component (there are a couple of exceptions, where a component may handle local component state); and a container,
which maps application state and event handlers to component properties. This follows the recommended practice outlined
in the `Redux documentation <http://redux.js.org/docs/basics/UsageWithReact.html>`_.


Connection /w Leaflet Map
-------------------------

A special-purpose component, ``MapConnector`` manages the interface between the Redux application state and the
Leaflet map, so that user interaction with the map will update the state, and changes to the state will update the map.

``MapConnector`` initializes the Leaflet map and does one-time setup during the mount phase in
``componentWillMount()``. The ``render()`` method is used to compare the application state with the actual map state
and update the map as necessary. ``render()`` returns null and the connector itself does not have any presence on page.

The Redux connect_ function is used to map relevant application state to the ``MapConnector``, and dispatch actions
based on map-related events.

.. _connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options

Async Calls
-----------

There are two workflows for making asynchronous requests to the backend server. The first is in response to user
action. This workflow is fairly straight-forward, a Redux action is dispatched, and the request is handled using
`Redux Thunk <http://redux.js.org/docs/advanced/AsyncActions.html#async-action-creators>`_. Actions such as "Run Tool"
and "Create PDF" are handled in this way.

The second workflow is a request triggered by a change in state. This is managed with the ``resync`` utility.

.. js:function:: resync(store, select, fetchData)

    :param object store: The Redux store
    :param function select:
        A function that will be called with the current application state and should return the state to watch
    :param function fetchData:
        The function called when the state has changed. The function signature is:
        ``fetchData(currentState, io, dispatch, previousState)``

The utility will watch some subset of the application state, determined by the user-provided ``select`` function. When
the watched state changes, it will call the user-defined ``fetchData`` function, providing references to the old and
new state, an ``io`` utility object and the store's dispatch function. The ``fetchData`` function is expected to make
async requests using the ``io`` object, and dispatch events as needed. The ``io`` utility automatically dismisses
responses if newer requests have been made in the meantime. For example, if a watched state changes, and a request is
made, then the state changes again and another request is made before the first returns, the response from the original
request will be ignored.

Saving and Loading Configurations
---------------------------------

Saving configurations is fairly straight-forward. Only the last completed run may be saved. Upon save, the ``lastRun``
state is serialized to JSON and sent to the server for storage. Since zone geometry does not to be represented in the
saved configuration, before serialization, the geometry is set to null.

When the application is loaded, all saved configurations are fetched form the server and stored in the ``saves`` state.
When the user loads a save, the configuration is loaded from JSON and used to update the ``runConfiguration`` state.
The change in state then triggers an async call to load zone geometry.

CSS
---

All style information for the react app, and the rest of the tool UI is stored in
``source/seedsource/static/sst/css/tool.css``.
