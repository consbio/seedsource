.. _setup-add-data:

Adding Data
===========

The Seedlot Seletion Tool depends on three types of data: climate data, as NetCDF files; region boundary data, as
shapefiles; and seed zone data, also as shapefiles.

Climate Data
------------

Climate data is represented as ncdjango services. To import the data, first place your data in your
``NC_SERVICE_DATA_ROOT`` directory (see :ref:`setup-install`) under a directory named ``regions``. The data should be
in a directory matching the region the data are for. The DEM should be placed in the directory for the region and named
``<region>_dem.nc``. Sub-directories should be created for each year / climate scenario. For example, the directory
structure for the ``west2`` region should be:

.. code-block:: text

    <NC_SERVICE_DATA_ROOT>
    +-- regions
    |   +-- west2
    |   |   +-- 1961_1990Y
    |   |   +-- 1991_2010Y
    |   |   +-- rcp45_2025Y
    |   |   +-- rcp45_2055Y
    |   |   +-- rcp45_2085Y
    |   |   +-- rcp85_2025Y
    |   |   +-- rcp85_2055Y
    |   |   +-- rcp85_2085Y
    |   |   +-- west2_dem.nc

Inside each directory for a year/scenario, each climate variable dataset should be named according to region, RCP,
year, and variable name in the following format: ``<region>_<rcp45/rcp85>_<year>Y_<variable>.nc``. The current
(1961_1990) and historic (1981_2010) years should not include an RCP. For example, the contents of the ``1961_1990Y``
and ``rcp45_2025Y`` directories for the ``west2`` region should be:

.. code-block:: text

    .
    +-- 1961_1990Y
    |   +-- west2_1961_1990Y_AHM.nc
    |   +-- west2_1961_1990Y_bFFP.nc
    |   +-- west2_1961_1990Y_CMD.nc
    |   +-- <...>
    +-- rcp45_2025Y
    |   +-- west2_rcp45_2025Y_AHM.nc
    |   +-- west2_rcp45_2025Y_bFFP.nc
    |   +-- west2_rcp45_2025Y_CMD.nc

Once all the data is in place, you can run the following command to create services for the region elevation and all
climate variables:

.. code-block:: text

    $ python manage.py populate_services <region>

The command will assume the variables: ``'MAT', 'MWMT', 'MCMT', 'TD', 'MAP', 'MSP', 'AHM', 'SHM', 'DD_0', 'DD5', 'FFP',
'PAS', 'EMT', 'EXT', 'Eref', 'CMD'`` and the years: ``'1961_1990', '1981_2010', 'rcp45_2025', 'rcp45_2055',
'rcp45_2085', 'rcp85_2025', 'rcp85_2055', 'rcp85_2085'``. If you are using difference variables and/or years, you will
need to edit the script, which is located at ``source/seedsource/management/commands/populate_services.py``.

Region Boundary Data
--------------------

You should simplify your boundary data before importing it into the tool. Next, import the region into the tool:

.. code-block:: text

    $ python manage.py add_region <region> <path to shapefile>


You should also convert the region boundary to GeoJSON and, it to the directory
``source/seedsource/static/sst/geometry/<region>_boundary.json``, and re-run:

.. code-block:: text

    $ npm run-script merge-regions

Seed Zone Data
--------------

In order to import a set of seed zones into the tool, create a ZIP archive with a ``config.json`` file, and a folder
containing the shapefile and related files. For example:

.. code-block:: text

    wa_seed_zones.zip
    +-- config.json
    +-- WA_NEW_ZONES
    |   +-- TSHE.shp
    |   +-- TSHE.dbf
    |   +-- TSHE.shx
    |   +-- TSHE.shp.xml

The ``config.json`` file contains information about the seed zones, and how to use and display them in the tool.
For example:

.. code-block:: json

  {
    "label": "Washington",
    "dir": "WA_NEW_ZONES",
    "species": {
      "psme": {
        "file": "PSME.shp",
        "label": "Washington (2002) Douglas-fir Zone {zone_id}",
        "name": "wa_psme_{zone_id}",
        "column": "ZONE_NO",
        "bands_fn": "wa_psme"
      },
      "pico": {
        "file": "PICO.shp",
        "label": "Washington (2002) lodgepole pine Zone {zone_id}",
        "name": "wa_pico_{zone_id}",
        "column": "ZONE_NO",
        "bands_fn": "wa_pico"
      },
      "pipo": {
        "file": "PIPO.shp",
        "label": "Washington (2002) ponderosa pine Zone {zone_id}",
        "name": "wa_pipo_{zone_id}",
        "column": "ZONE_NO",
        "bands_fn": "wa_pipo"
      },
      "thpl": {
        "file": "THPL.shp",
        "label": "Washington (2002) western redcedar Zone {zone_id}",
        "name": "wa_thpl_{zone_id}",
        "column": "ZONE_NO",
        "bands_fn": "wa_thpl"
      },
      "pimo": {
        "file": "PIMO.shp",
        "label": "Washington (2002) western white pine Zone {zone_id}",
        "name": "wa_pimo_{zone_id}",
        "column": "ZONE_NO",
        "bands_fn": "wa_pimo"
      }
    }
  }

The ``label`` and ``name`` properties both have substitutions for the zone id. The ``label`` will be shown to users
with the zone id substituted. The ``name`` is used to uniquely identify the zone in the database.

The ``column`` property specifies the column in the shapefile table which contains the ID for each zone.

The ``bans_fn`` property specifies an elevations bands function to use in generating elevation bands. The following
band functions are also available:

* ``historical`` Generates 500-ft elevation bands
* ``no_bands`` Generates a single elvation band for the entire elevation range of the zone

Generic (not species-specific seed zones) can use the "generic" key in the ``config.json`` file:

.. code-block:: json

  {
    "label": "Historic",
    "dir": "historic_seed_zones",
    "species": {
      "generic": {
        "file": "historic_seed_zones.shp",
        "label": "",
        "name": "wa_or_historic_{zone_id}",
        "column": "SUBJ_FSZ",
        "bands_fn": "historical"
      }
    }
  }

Once you have created the ZIP archive, you can import it with the following command:

.. code-block:: text

    $ python manage.py import_seed_zones <path_to_zones_file>.zip

After importing the zones, you should run the ``calculate_zone_transfers`` command to generate transfer limits for each
zone and elevation band (you will need to have service data for the appropriate region loaded first). Running the
command with no arguments will process all zone sets:

.. code-block:: text

    $ python manage.py calculate_zone_transfers

Running the command with a ``source`` argument (<directory>/<shapefile>.shp) will process only zones for a single set:

.. code-block:: text

    $ python manage.py calculate_zone_transfers WA_NEW_ZONES/TSHE.shp
