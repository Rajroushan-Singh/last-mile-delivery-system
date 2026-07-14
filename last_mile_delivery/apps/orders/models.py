from django.db import models

from apps.accounts.models import User
from apps.ratecards.models import RateCard


class Order(models.Model):

    STATUS_CHOICES = (
        ("CREATED", "Created"),
        ("ASSIGNED", "Assigned"),
        ("PICKED_UP", "Picked Up"),
        ("IN_TRANSIT", "In Transit"),
        ("OUT_FOR_DELIVERY", "Out For Delivery"),
        ("DELIVERED", "Delivered"),
        ("FAILED", "Failed"),
        ("CANCELLED", "Cancelled"),
        ("RESCHEDULED", "Rescheduled"),
    )


    ORDER_TYPE = (
        ("B2B", "B2B"),
        ("B2C", "B2C"),
    )


    PAYMENT_TYPE = (
        ("PREPAID", "Prepaid"),
        ("COD", "Cash On Delivery"),
    )


    # Customer who created order
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="orders",
    )


    # Assigned delivery agent
    assigned_agent = models.ForeignKey(
        "agents.DeliveryAgent",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )


    # Pickup and drop zones
    pickup_zone = models.ForeignKey(
        "zones.Zone",
        on_delete=models.PROTECT,
        related_name="pickup_orders",
    )


    drop_zone = models.ForeignKey(
        "zones.Zone",
        on_delete=models.PROTECT,
        related_name="drop_orders",
    )


    # Rate card used for pricing
    rate_card = models.ForeignKey(
        RateCard,
        on_delete=models.PROTECT,
    )


    pickup_address = models.TextField()

    drop_address = models.TextField()


    # Package dimensions

    length = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )


    breadth = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )


    height = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )


    actual_weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )


    # Calculated weights

    volumetric_weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )


    billable_weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )


    order_type = models.CharField(
        max_length=3,
        choices=ORDER_TYPE,
    )


    payment_type = models.CharField(
        max_length=10,
        choices=PAYMENT_TYPE,
    )


    delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )


    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="CREATED",
    )


    # Tracking timestamps

    assigned_at = models.DateTimeField(
        null=True,
        blank=True
    )


    picked_up_at = models.DateTimeField(
        null=True,
        blank=True
    )


    in_transit_at = models.DateTimeField(
        null=True,
        blank=True
    )


    out_for_delivery_at = models.DateTimeField(
        null=True,
        blank=True
    )


    delivered_at = models.DateTimeField(
        null=True,
        blank=True
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):
        return f"Order #{self.id}"