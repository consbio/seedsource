import mercantile
from clover.geometry.bbox import BBox
from ncdjango.config import RenderConfiguration
from ncdjango.views import GetImageViewBase
from pyproj import Proj

TILE_SIZE = (256, 256)


class GetImageView(GetImageViewBase):
    def get_service_name(self, request, *args, **kwargs):
        return kwargs['service_name']

    def get_render_configurations(self, request, **kwargs):
        tile_bounds = list(mercantile.bounds(int(self.kwargs['x']), int(self.kwargs['y']), int(self.kwargs['z'])))
        extent = BBox(tile_bounds, projection=Proj('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')).project(
            Proj(
                '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
            )
        )

        return [
            RenderConfiguration(
                variable=x,
                extent=extent,
                size=TILE_SIZE,
                image_format='png'
            ) for x in self.service.variable_set.all()
        ]
