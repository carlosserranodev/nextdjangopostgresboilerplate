from django.urls import path
from . import views

urlpatterns = [
    path('create-link-token/', views.create_link_token, name='create-link-token'),
    path('exchange-token/', views.exchange_public_token, name='exchange-token'),
    path('sync-transactions/', views.sync_transactions, name='sync-transactions'),
    path('accounts/', views.get_accounts, name='plaid-accounts'),
    path('disconnect/', views.disconnect_plaid, name='disconnect-plaid'),
]
