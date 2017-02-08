from django.conf.urls import url, include
from django.views.generic.base import TemplateView
from rest_framework.routers import DefaultRouter

from seedsource.views import TransferLimitViewset, SeedZoneViewset, GeneratePDFView, RegionsFromPoint
from .views import RunConfigurationViewset
import seedsource.tasks  # Make sure tasks are registered

router = DefaultRouter()
router.register('run-configurations', RunConfigurationViewset)
router.register('seedzones', SeedZoneViewset)
router.register('transfer-limits', TransferLimitViewset)

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='tool.html'), name='tool_page'),
    url(r'^', include(router.urls)),
    url(r'^create-pdf/$', GeneratePDFView.as_view(), name='create_pdf'),
    url(r'^regions/$', RegionsFromPoint.as_view(), name='regions')
]
