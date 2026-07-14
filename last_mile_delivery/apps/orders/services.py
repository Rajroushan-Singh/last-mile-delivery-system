from decimal import Decimal
from django.utils import timezone


class DeliveryChargeService:

    VOLUMETRIC_DIVISOR = Decimal("5000")


    @staticmethod
    def calculate(order):

        # Volumetric weight calculation
        volumetric_weight = (
            order.length *
            order.breadth *
            order.height
        ) / DeliveryChargeService.VOLUMETRIC_DIVISOR


        # Chargeable weight
        billable_weight = max(
            volumetric_weight,
            order.actual_weight
        )


        rate = order.rate_card


        # Same zone pricing
        if order.pickup_zone == order.drop_zone:

            delivery_charge = (
                rate.intra_zone_rate *
                billable_weight
            )

        # Different zone pricing
        else:

            delivery_charge = (
                rate.inter_zone_rate *
                billable_weight
            )


        # COD additional charge
        if order.payment_type == "COD":

            delivery_charge += rate.cod_surcharge



        return {

            "volumetric_weight": round(
                volumetric_weight,
                2
            ),

            "billable_weight": round(
                billable_weight,
                2
            ),

            "delivery_charge": round(
                delivery_charge,
                2
            )
        }





class OrderTrackingService:


    @staticmethod
    def pickup(order):

        order.status = "PICKED_UP"

        order.picked_up_at = timezone.now()

        order.save()



    @staticmethod
    def in_transit(order):

        order.status = "IN_TRANSIT"

        order.in_transit_at = timezone.now()

        order.save()



    @staticmethod
    def out_for_delivery(order):

        order.status = "OUT_FOR_DELIVERY"

        order.out_for_delivery_at = timezone.now()

        order.save()



    @staticmethod
    def delivered(order):

        order.status = "DELIVERED"

        order.delivered_at = timezone.now()


        # Free agent after delivery
        if order.assigned_agent:

            order.assigned_agent.status = "AVAILABLE"

            order.assigned_agent.save()


        order.save()