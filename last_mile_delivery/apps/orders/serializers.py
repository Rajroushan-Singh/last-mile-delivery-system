from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Order

        fields = "__all__"

        read_only_fields = (
            "customer",
            "rate_card",
            "status",
            "delivery_charge",
            "volumetric_weight",
            "billable_weight",
            "created_at",
            "updated_at",
        )