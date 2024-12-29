from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch
from .services import PlaidService

class PlaidIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    @patch.object(PlaidService, 'create_link_token')
    def test_create_link_token(self, mock_create_link_token):
        """Test creating a Plaid link token"""
        mock_create_link_token.return_value = 'test_link_token'
        url = reverse('create-link-token')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['link_token'], 'test_link_token')

    @patch.object(PlaidService, 'exchange_public_token')
    @patch.object(PlaidService, 'get_accounts')
    def test_exchange_public_token(self, mock_get_accounts, mock_exchange):
        """Test exchanging public token"""
        mock_exchange.return_value = ('test_access_token', 'test_item_id')
        mock_get_accounts.return_value = [{
            'account_id': 'test_account',
            'name': 'Test Account',
            'type': 'checking',
            'balances': {
                'current': 1000.00,
                'iso_currency_code': 'USD'
            }
        }]
        
        url = reverse('exchange-token')
        data = {'public_token': 'test_public_token'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
