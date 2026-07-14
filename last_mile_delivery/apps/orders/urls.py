from django.urls import path

from .views import (
    OrderListCreateView,
    OrderDetailView,
    PickupOrderView,
    TransitOrderView,
    OutForDeliveryView,
    DeliveredOrderView,
)

urlpatterns = [

    path("", OrderListCreateView.as_view()),

    path("<int:pk>/", OrderDetailView.as_view()),

    path("<int:pk>/pickup/", PickupOrderView.as_view()),

    path("<int:pk>/in-transit/", TransitOrderView.as_view()),

    path("<int:pk>/out-for-delivery/", OutForDeliveryView.as_view()),

    path("<int:pk>/delivered/", DeliveredOrderView.as_view()),
]