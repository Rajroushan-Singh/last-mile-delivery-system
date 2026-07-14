from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/v1/auth/", include("apps.accounts.urls")),

    path("api/v1/", include("apps.zones.urls")),

    path("api/v1/", include("apps.ratecards.urls")),

    # CHANGE THIS
    path("api/v1/orders/", include("apps.orders.urls")),

    path("api/v1/", include("apps.agents.urls")),
]