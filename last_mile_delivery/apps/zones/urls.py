from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ZoneViewSet, AreaViewSet

router = DefaultRouter()

router.register(
    "zones",
    ZoneViewSet,
)

router.register(
    "areas",
    AreaViewSet,
)

urlpatterns = [
    path(
        "",
        include(router.urls),
    ),
]