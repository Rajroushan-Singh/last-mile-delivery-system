from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DeliveryAgent
from .serializers import DeliveryAgentSerializer


class DeliveryAgentViewSet(viewsets.ModelViewSet):

    queryset = DeliveryAgent.objects.all()
    serializer_class = DeliveryAgentSerializer

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated
        from .permissions import IsAdmin
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [IsAuthenticated()]

    # Agent Dashboard
    @action(
        detail=True,
        methods=["get"]
    )
    def dashboard(self, request, pk=None):

        agent = self.get_object()

        data = {

            "id": agent.id,

            "name": agent.user.username,

            "phone": agent.phone,

            "vehicle_type": agent.vehicle_type,


            "current_zone": {

                "id": agent.current_zone.id,

                "name": agent.current_zone.name

            } if agent.current_zone else None,


            "status": agent.status
        }


        return Response(data)



    # Update Agent Status
    @action(
        detail=True,
        methods=["patch"]
    )
    def update_status(self, request, pk=None):

        agent = self.get_object()


        agent.status = request.data.get(
            "status"
        )


        agent.save()


        return Response(
            {
                "message": "Status updated successfully",

                "status": agent.status
            }
        )

    # Get Agent's Assigned Orders
    @action(
        detail=True,
        methods=["get"]
    )
    def orders(self, request, pk=None):
        agent = self.get_object()
        from apps.orders.models import Order
        from apps.orders.serializers import OrderSerializer
        orders = Order.objects.filter(assigned_agent=agent)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)