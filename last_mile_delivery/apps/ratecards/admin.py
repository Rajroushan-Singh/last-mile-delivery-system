from django.contrib import admin

from .models import RateCard


@admin.register(RateCard)
class RateCardAdmin(admin.ModelAdmin):

    list_display = (
        "order_type",
        "intra_zone_rate",
        "inter_zone_rate",
        "cod_surcharge",
        "is_active",
    )

    list_filter = (
        "order_type",
        "is_active",
    )