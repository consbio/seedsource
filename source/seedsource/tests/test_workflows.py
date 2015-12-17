import os

import numpy
from clover.geometry.bbox import BBox
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.workflow import Workflow

WORKFLOWS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'workflows')


def test_generate_scores_workflow():
    with open(os.path.join(WORKFLOWS_DIR, 'generate_scores_workflow.json'), 'r') as f:
        workflow = Workflow.from_json(f.read())

    raster_1 = Raster(numpy.reshape(numpy.arange(100), (10, 10)), BBox((0, 0, 10, 10)), 1, 0)
    raster_2 = Raster(numpy.reshape(numpy.arange(100, 200), (10, 10)), BBox((0, 0, 10, 10)), 1, 0)
    limits = [{'min': 30, 'max': 70}, {'min': 140, 'max': 160}]

    workflow(variables=[raster_1, raster_2], limits=limits)
