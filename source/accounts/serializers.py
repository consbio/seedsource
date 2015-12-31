from django.contrib.auth import get_user_model
from rest_framework import serializers


class UniqueEmailMixin(object):
    def validate_email(self, value):
        if get_user_model().objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('An account with this email address already exists.')
        return value


class CreateAccountSerializer(UniqueEmailMixin, serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        return get_user_model().objects.create_user(
                validated_data['email'], validated_data['email'], validated_data['password']
        )


class ChangeEmailSerializer(UniqueEmailMixin, serializers.Serializer):
    email = serializers.EmailField()

    def update(self, instance, validated_data):
        instance.username = validated_data['email']
        instance.email = validated_data['email']
        instance.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def update(self, instance, validated_data):
        instance.set_password(validated_data['password'])
        instance.save()

        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()
