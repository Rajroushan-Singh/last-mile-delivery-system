from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import RateCardViewSet

router = DefaultRouter()

router.register(
    "ratecards",
    RateCardViewSet,
    basename="ratecards"
)

urlpatterns = [
    path("", include(router.urls)),
]