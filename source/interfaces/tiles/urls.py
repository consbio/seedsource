from django.conf.urls import url

from interfaces.tiles.views import GetImageView

urlpatterns = [
    url(
        r'^tiles/(?P<service_name>[\w\-/]+?)/(?P<z>\d+)/(?P<x>\d+)/(?P<y>\d+).png$', GetImageView.as_view(),
        name='tiles_get_image'
    )
]
