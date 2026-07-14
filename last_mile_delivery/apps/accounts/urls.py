from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, AdminUserListView

urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "users/",
        AdminUserListView.as_view(),
        name="admin_users",
    ),
]