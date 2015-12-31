from django.contrib.auth import login, authenticate, update_session_auth_hash, logout
from rest_framework.generics import CreateAPIView, UpdateAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.serializers import CreateAccountSerializer, ChangePasswordSerializer, ChangeEmailSerializer, \
    LoginSerializer


class CreateAccountView(CreateAPIView):
    serializer_class = CreateAccountSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user = authenticate(user=user)
        login(self.request, user)


class UpdateEmailView(UpdateAPIView):
    serializer_class = ChangeEmailSerializer
    permission_classes = (IsAuthenticated,)

    def put(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def get_object(self):
        return self.request.user


class UpdatePasswordView(GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    def put(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        update_session_auth_hash(request, user)

        return Response()


class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = authenticate(username=data['email'], password=data['password'])
        if user:
            login(request, user)
            return Response()
        else:
            return Response(status=401)


class LogoutView(GenericAPIView):
    def get(self, request, *args, **kwargs):
        logout(request)

        return Response()
