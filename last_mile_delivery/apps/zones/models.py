from django.db import models


class Zone(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Area(models.Model):
    zone = models.ForeignKey(
        Zone,
        on_delete=models.CASCADE,
        related_name="areas"
    )

    name = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("zone", "name")

    def __str__(self):
        return f"{self.name} ({self.zone.name})"