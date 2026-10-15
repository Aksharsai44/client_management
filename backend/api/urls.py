from django.urls import path
from . import views

urlpatterns = [
    path('', views.health_check, name='api_root'),
    path('health/', views.health_check, name='health_check'),
    path('demo-requests/', views.demo_requests_list_create, name='demo_requests_list_create'),
    path('demo-requests/events/', views.demo_requests_stream, name='demo_requests_stream'),
    path('demo-requests/seed/', views.seed_initial_demo_requests, name='seed_initial_demo_requests'),
    path('demo-requests/<str:pk>/', views.demo_request_detail, name='demo_request_detail'),
    path('demo-requests/<str:pk>/credential/', views.demo_request_credential, name='demo_request_credential'),
    path('pricing-plans/', views.pricing_plans_list_create, name='pricing_plans_list_create'),
    path('pricing-plans/seed/', views.seed_initial_pricing_plans, name='seed_initial_pricing_plans'),
    path('pricing-plans/<str:pk>/', views.pricing_plan_detail, name='pricing_plan_detail'),
    path('auth/product-admin/login/', views.product_admin_login, name='product_admin_login'),
    path('auth/product-admin/info/', views.product_admin_info, name='product_admin_info'),
    path('company-organizations/', views.company_organizations_list_create, name='company_organizations_list_create'),
    path('company-organizations/seed/', views.seed_initial_company_organizations, name='seed_initial_company_organizations'),
    path('company-organizations/<str:pk>/', views.company_organization_detail, name='company_organization_detail'),
    path('product-admins/', views.product_admin_users_list_create, name='product_admin_users_list_create'),
    path('product-admins/seed/', views.seed_initial_product_admins, name='seed_initial_product_admins'),
    path('product-admins/<str:pk>/', views.product_admin_user_detail, name='product_admin_user_detail'),
    path('client-companies/', views.client_companies_list_create, name='client_companies_list_create'),
    path('client-companies/seed/', views.seed_initial_client_companies, name='seed_initial_client_companies'),
    path('client-companies/<str:pk>/', views.client_company_detail, name='client_company_detail'),
    path('users/', views.workspace_users_list_create, name='workspace_users_list_create'),
    path('users/seed/', views.seed_initial_workspace_users, name='seed_initial_workspace_users'),
    path('users/<str:pk>/', views.workspace_user_detail, name='workspace_user_detail'),
]
