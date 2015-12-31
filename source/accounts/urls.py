from django.conf.urls import url

from accounts.views import CreateAccountView, UpdateEmailView, UpdatePasswordView, LogoutView, LoginView

urlpatterns = [
    url(r'^create-account/$', CreateAccountView.as_view()),
    url(r'^change-email/$', UpdateEmailView.as_view()),
    url(r'^change-password/$', UpdatePasswordView.as_view()),
    url(r'^login/$', LoginView.as_view()),
    url(r'^logout/$', LogoutView.as_view())
]
