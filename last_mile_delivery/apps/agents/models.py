from django.db import models

from apps.accounts.models import User
from apps.zones.models import Zone


class DeliveryAgent(models.Model):

    STATUS_CHOICES = (
        ("AVAILABLE", "Available"),
        ("BUSY", "Busy"),
        ("OFFLINE", "Offline"),
    )

    VEHICLE_CHOICES = (
        ("BIKE", "Bike"),
        ("SCOOTER", "Scooter"),
        ("VAN", "Van"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="delivery_agent",
    )

    phone = models.CharField(
        max_length=15
    )

    vehicle_type = models.CharField(
        max_length=10,
        choices=VEHICLE_CHOICES,
    )

    current_zone = models.ForeignKey(
        Zone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_agents"
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="AVAILABLE",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):
        return self.user.username