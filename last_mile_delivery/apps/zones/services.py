from .models import Zone, Area


class ZoneService:

    @staticmethod
    def get_all():
        return Zone.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Zone.objects.get(pk=pk)

    @staticmethod
    def create(serializer):
        return serializer.save()

    @staticmethod
    def update(serializer):
        return serializer.save()

    @staticmethod
    def delete(zone):
        zone.delete()


class AreaService:

    @staticmethod
    def get_all():
        return Area.objects.select_related("zone")

    @staticmethod
    def get_by_id(pk):
        return Area.objects.get(pk=pk)

    @staticmethod
    def create(serializer):
        return serializer.save()

    @staticmethod
    def update(serializer):
        return serializer.save()

    @staticmethod
    def delete(area):
        area.delete()