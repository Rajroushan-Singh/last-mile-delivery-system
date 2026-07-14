from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "confirm_password",
            "phone_number",
            "role"
        ]

        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"password": "Passwords do not match"}
            )

        return attrs

    def create(self, validated_data):

        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            phone_number=validated_data.get("phone_number"),
            role=validated_data.get("role")
        )

        return user
    



from django.contrib.auth import authenticate


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):

        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        attrs["user"] = user
        return attrs