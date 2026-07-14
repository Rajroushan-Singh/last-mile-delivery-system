from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import RateCard
from .serializers import RateCardSerializer
from .permissions import IsAdmin


class RateCardViewSet(viewsets.ModelViewSet):

    queryset = RateCard.objects.all()
    serializer_class = RateCardSerializer

    def get_permissions(self):

        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]

        return [IsAdmin()]