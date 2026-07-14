from rest_framework import serializers
from .models import DeliveryAgent


class DeliveryAgentSerializer(serializers.ModelSerializer):

    class Meta:

        model = DeliveryAgent

        fields = [
            "id",
            "user",
            "phone",
            "vehicle_type",
            "current_zone",
            "status"
        ]