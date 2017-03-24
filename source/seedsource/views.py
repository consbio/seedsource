import json

from django.contrib.gis.geos import Point
from django.db.models import Q
from django.http import HttpResponse
from numpy.ma.core import is_masked
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.exceptions import ParseError
from rest_framework.filters import DjangoFilterBackend
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from seedsource.models import TransferLimit, SeedZone, RunConfiguration, Region
from seedsource.report import Report
from seedsource.serializers import RunConfigurationSerializer, SeedZoneSerializer, GenerateReportSerializer
from seedsource.serializers import TransferLimitSerializer, RegionSerializer
from seedsource.utils import get_elevation_at_point, get_regions_for_point

PPTX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation' # maybe we need it, maybe we dont


class RunConfigurationViewset(viewsets.ModelViewSet):
    queryset = RunConfiguration.objects.all()
    serializer_class = RunConfigurationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return RunConfiguration.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SeedZoneViewset(viewsets.ReadOnlyModelViewSet):
    queryset = SeedZone.objects.all()
    serializer_class = SeedZoneSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('species',)
    lookup_field = 'zone_uid'

    def get_queryset(self):
        if not self.request.query_params.get('point'):
            return self.queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params['point'].split(',')]
            except ValueError:
                raise ParseError()
            point = Point(x, y)

            return self.queryset.filter(polygon__intersects=point)

    @detail_route(methods=['get'])
    def geometry(self, *args, **kwargs):
        return Response(json.loads(self.get_object().polygon.geojson))


class TransferLimitViewset(viewsets.ReadOnlyModelViewSet):
    queryset = TransferLimit.objects.all().select_related('zone').defer('zone__polygon')
    serializer_class = TransferLimitSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('variable', 'time_period', 'zone_id', 'zone__zone_uid')

    def get_queryset(self):
        if not self.request.query_params.get('point'):
            return self.queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params['point'].split(',')]
            except ValueError:
                raise ParseError()

            elevation = get_elevation_at_point(Point(x, y))

            if elevation is None or is_masked(elevation):
                return self.queryset.none()

            # Elevation bands are stored in feet
            return self.queryset.filter(
                Q(low__lt=elevation/0.3048, high__gte=elevation/0.3048) | Q(low__isnull=True, high__isnull=True)
            )


class ReportViewBase(GenericAPIView):
    serializer_class = GenerateReportSerializer

    def _response(self, report):
        raise NotImplementedError

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return self._response(Report(data['configuration'], data['zoom'], data['tile_layers'], data['opacity']))


class GeneratePDFView(ReportViewBase):
    def _response(self, report):
        pdf_data = report.get_pdf_data()
        response = HttpResponse(content=pdf_data.getvalue(), content_type='application/x-pdf')
        response['Content-disposition'] = 'attachment; filename=report.pdf'
        return response


class GeneratePowerPointView(ReportViewBase):
    def _response(self, report):
        pptx_data = report.get_pptx_data()
        response = HttpResponse(content=pptx_data.getvalue(), content_type='application/vnd.ms-powerpoint')
        response['Content-disposition'] = 'attachment; filename=report.pptx'
        return response


class RegionsView(ListAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

    def get_queryset(self):
        if not self.request.query_params.get('point'):
            return self.queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params['point'].split(',')]
            except ValueError:
                raise ParseError()

            point = Point(x, y)
            return get_regions_for_point(point)
