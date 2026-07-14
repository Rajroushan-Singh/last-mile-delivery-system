from django.db import models


class RateCard(models.Model):

    ORDER_TYPES = (
        ("B2B", "B2B"),
        ("B2C", "B2C"),
    )

    order_type = models.CharField(
        max_length=3,
        choices=ORDER_TYPES
    )

    intra_zone_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    inter_zone_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    cod_surcharge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.order_type