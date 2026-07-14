from apps.agents.models import DeliveryAgent


def assign_agent(zone):

    agent = DeliveryAgent.objects.filter(
        current_zone=zone,
        status="AVAILABLE"
    ).first()


    return agent