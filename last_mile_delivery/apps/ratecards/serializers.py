from rest_framework import serializers

from .models import RateCard


class RateCardSerializer(serializers.ModelSerializer):

    class Meta:
        model = RateCard
        fields = "__all__"