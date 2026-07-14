
from .models import DeliveryAgent


class AgentAssignmentService:

    @staticmethod
    def assign(order):

        agent = DeliveryAgent.objects.filter(
            status="AVAILABLE",
            current_zone=order.pickup_zone
        ).first()

        if not agent:
            return None

        agent.status = "BUSY"
        agent.save()

        return agent