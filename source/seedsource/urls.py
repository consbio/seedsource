from django.conf.urls import url
from django.views.generic.base import TemplateView

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='tool.html'), name='tool_page'),
    url(r'^tests/run-job/$', TemplateView.as_view(template_name='tests/run_job.html'), name='test_run_job')
]
