from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "CUSTOMER"
        )
    

class IsAgent(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "DELIVERY_AGENT"
        )