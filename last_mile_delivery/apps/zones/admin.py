from django.contrib import admin

from .models import Zone, Area


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "is_active",
    )

    search_fields = (
        "name",
    )


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "zone",
        "pincode",
    )

    list_filter = (
        "zone",
    )

    search_fields = (
        "name",
        "pincode",
    )