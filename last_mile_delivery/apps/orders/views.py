from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.ratecards.models import RateCard
from apps.agents.services import AgentAssignmentService

from .models import Order
from .serializers import OrderSerializer
from .permissions import IsCustomer, IsAgent
from .services import DeliveryChargeService, OrderTrackingService


class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == "ADMIN":
            orders = Order.objects.all().order_by("-id")
        elif user.role == "DELIVERY_AGENT":
            orders = Order.objects.filter(assigned_agent__user=user).order_by("-id")
        elif user.role == "CUSTOMER":
            orders = Order.objects.filter(customer=user).order_by("-id")
        else:
            orders = Order.objects.none()

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "CUSTOMER":
            return Response(
                {"error": "Only customers can create orders."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = OrderSerializer(
            data=request.data
        )

        if serializer.is_valid():

            # Find active rate card
            rate_card = RateCard.objects.filter(
                order_type=request.data["order_type"],
                is_active=True
            ).first()


            if not rate_card:

                return Response(
                    {
                        "error": "No active rate card found."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )


            # Create order
            order = serializer.save(
                customer=request.user,
                rate_card=rate_card
            )


            # Calculate delivery charges
            result = DeliveryChargeService.calculate(
                order
            )


            order.volumetric_weight = result[
                "volumetric_weight"
            ]

            order.billable_weight = result[
                "billable_weight"
            ]

            order.delivery_charge = result[
                "delivery_charge"
            ]


            # Auto assign delivery agent
            agent = AgentAssignmentService.assign(
                order
            )


            if agent:

                order.assigned_agent = agent

                order.status = "ASSIGNED"

                agent.status = "BUSY"

                agent.save()


            order.save()


            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )


        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        user = request.user

        if user.role == "ADMIN":
            authorized = True
        elif user.role == "DELIVERY_AGENT":
            authorized = (order.assigned_agent is not None and order.assigned_agent.user == user)
        elif user.role == "CUSTOMER":
            authorized = (order.customer == user)
        else:
            authorized = False

        if not authorized:
            return Response(
                {"error": "You do not have permission to view this order."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data)




class PickupOrderView(APIView):

    permission_classes = [IsAgent]


    def patch(self, request, pk):

        order = get_object_or_404(
            Order,
            pk=pk
        )


        OrderTrackingService.pickup(
            order
        )


        return Response(
            OrderSerializer(order).data
        )




class TransitOrderView(APIView):

    permission_classes = [IsAgent]


    def patch(self, request, pk):

        order = get_object_or_404(
            Order,
            pk=pk
        )


        OrderTrackingService.in_transit(
            order
        )


        return Response(
            OrderSerializer(order).data
        )




class OutForDeliveryView(APIView):

    permission_classes = [IsAgent]


    def patch(self, request, pk):

        order = get_object_or_404(
            Order,
            pk=pk
        )


        OrderTrackingService.out_for_delivery(
            order
        )


        return Response(
            OrderSerializer(order).data
        )




class DeliveredOrderView(APIView):

    permission_classes = [IsAgent]


    def patch(self, request, pk):

        order = get_object_or_404(
            Order,
            pk=pk
        )


        OrderTrackingService.delivered(
            order
        )


        return Response(
            OrderSerializer(order).data
        )