from django.conf.urls import include, url
from django.views.generic.base import TemplateView

from . import views

urlpatterns = [
    url(r'^create-account/$', views.CreateAccountView.as_view()),
    url(r'^change-email/$', views.UpdateEmailView.as_view()),
    url(r'^change-password/$', views.UpdatePasswordView.as_view()),
    url(r'^login/$', views.LoginView.as_view()),
    url(r'^logout/$', views.LogoutView.as_view()),
    url(r'^user-info/$', views.UserInfoView.as_view()),
    url(r'^lost-password/$', views.LostPasswordView.as_view()),
    url(r'^reset-password/(?P<token>[0-9A-Za-z\-]{36})/', views.PasswordResetView.as_view(), name='reset_password'),
    url(
        r'^reset-password-success/', TemplateView.as_view(template_name='password_reset_success.html'),
        name='reset_password_success'
    ),
    url('', include('social_django.urls', namespace='social'))
]
