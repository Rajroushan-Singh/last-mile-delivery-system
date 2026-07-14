from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Zone, Area
from .serializers import ZoneSerializer, AreaSerializer
from .permissions import IsAdminRole


class ZoneViewSet(viewsets.ModelViewSet):

    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer

    def get_permissions(self):

        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:
            return [IsAuthenticated(), IsAdminRole()]

        return [IsAuthenticated()]


class AreaViewSet(viewsets.ModelViewSet):

    queryset = Area.objects.select_related("zone")
    serializer_class = AreaSerializer

    def get_permissions(self):

        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:
            return [IsAuthenticated(), IsAdminRole()]

        return [IsAuthenticated()]