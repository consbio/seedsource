from django import forms

from accounts.models import PasswordResetToken


class PasswordResetForm(forms.Form):
    token = forms.CharField()
    password = forms.CharField()
    confirm = forms.CharField()

    def clean_token(self):
        data = self.cleaned_data.get('token', '')

        try:
            token = PasswordResetToken.objects.get(token=data)
        except PasswordResetToken.DoesNotExist:
            raise forms.ValidationError('Sorry, the link you are using is not valid.', 'invalid_token')

        if token.used:
            raise forms.ValidationError('This link has already been used.', 'token_used')

        return data

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm')

        if password != confirm_password:
            raise forms.ValidationError('Passwords do not match.', 'password_mismatch')
