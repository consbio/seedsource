from django.conf.urls import url, include
from django.views.generic.base import TemplateView
from rest_framework.routers import DefaultRouter

from .views import RunConfigurationViewset
import seedsource.tasks  # Make sure tasks are registered

router = DefaultRouter()
router.register('run-configurations', RunConfigurationViewset)

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='tool.html'), name='tool_page'),
    url(r'^tests/run-job/$', TemplateView.as_view(template_name='tests/run_job.html'), name='test_run_job'),
    url(r'^', include(router.urls))
]
