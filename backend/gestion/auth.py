from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers


class UsernameOrEmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get("password")
        if not username or not password:
            raise serializers.ValidationError({"detail": "Credenciales incompletas"})

        # Permitir login por email o username
        if "@" in username:
            User = get_user_model()
            try:
                user = User.objects.get(email__iexact=username)
                attrs[self.username_field] = user.get_username()
            except User.DoesNotExist:
                pass  # caerá al validador base con el username recibido

        return super().validate(attrs)


class UsernameOrEmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = UsernameOrEmailTokenObtainPairSerializer

