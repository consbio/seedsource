from django.conf.urls import url, include
from django.views.generic.base import TemplateView
from rest_framework.routers import DefaultRouter

from seedsource import views
import seedsource.tasks  # Make sure tasks are registered

router = DefaultRouter()
router.register('run-configurations', views.RunConfigurationViewset)
router.register('seedzones', views.SeedZoneViewset)
router.register('transfer-limits', views.TransferLimitViewset)

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='tool.html'), name='tool_page'),
    url(r'^', include(router.urls)),
    url(r'^create-pdf/$', views.GeneratePDFView.as_view(), name='create_pdf'),
    url(r'^create-ppt/$', views.GeneratePowerPointView.as_view(), name='create_ppt'),
    url(r'^regions/$', views.RegionsView.as_view(), name='regions')
]
