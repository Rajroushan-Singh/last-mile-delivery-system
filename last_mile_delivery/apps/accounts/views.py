from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "User registered successfully"
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "success": True,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "username": user.username,
                    "role": user.role,
                    "user_id": user.id,
                }
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdminUserRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class AdminUserListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        role = request.query_params.get("role")
        eligible_only = request.query_params.get("eligible_only") == "true"
        
        queryset = User.objects.all()
        if role:
            queryset = queryset.filter(role=role)
            
        if eligible_only and role == "DELIVERY_AGENT":
            queryset = queryset.filter(delivery_agent__isnull=True)
            
        users_data = []
        for u in queryset:
            users_data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "phone_number": u.phone_number,
                "role": u.role,
            })
            
        return Response(users_data)