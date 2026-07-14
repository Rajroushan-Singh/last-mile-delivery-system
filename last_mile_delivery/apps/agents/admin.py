from django.contrib import admin

from .models import DeliveryAgent


@admin.register(DeliveryAgent)
class DeliveryAgentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "vehicle_type",
        "current_zone",
        "status",
    )

    list_filter = (
        "status",
        "vehicle_type",
    )