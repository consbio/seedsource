import os

import numpy
from clover.geometry.bbox import BBox
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.workflow import Workflow

WORKFLOWS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'workflows')


def test_generate_scores_workflow_sanity():
    with open(os.path.join(WORKFLOWS_DIR, 'generate_scores_workflow.json'), 'r') as f:
        workflow = Workflow.from_json(f.read())

    # Simple
    raster_1 = Raster(numpy.reshape(numpy.arange(100), (10, 10)), BBox((0, 0, 10, 10)), 1, 0)
    raster_2 = Raster(numpy.reshape(numpy.arange(100, 200), (10, 10)), BBox((0, 0, 10, 10)), 1, 0)
    limits = [{'min': 30, 'max': 70}, {'min': 140, 'max': 160}]

    workflow(variables=[raster_1, raster_2], limits=limits)


def test_generate_scores_workflow_validity():
    """Test simple 2x2 grid against pre-calculated values"""

    with open(os.path.join(WORKFLOWS_DIR, 'generate_scores_workflow.json'), 'r') as f:
        workflow = Workflow.from_json(f.read())

    ahm = Raster(numpy.array([[284, 274], [307, 298]]), BBox((0, 0, 10, 10)), 1, 0)
    cmd = Raster(numpy.array([[292, 305], [300, 291]]), BBox((0, 0, 10, 10)), 1, 0)
    limits = [{'min': 264, 'max': 304}, {'min': 271, 'max': 311}]
    expected_mask = numpy.array([[False, False], [True, False]])
    expected_results = numpy.ma.masked_array([[5, 86], [None, 70]], mask=expected_mask)

    results = workflow(variables=[ahm, cmd], limits=limits)

    assert (results['raster_out'].mask == expected_mask).all()
    assert (results['raster_out'] == expected_results).all()
