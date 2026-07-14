from rest_framework import serializers
from .models import Zone, Area


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )


class AreaSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(
        source="zone.name",
        read_only=True
    )

    class Meta:
        model = Area
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )