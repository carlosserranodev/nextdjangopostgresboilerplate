from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import Transaction
from accounts.models import BankAccount
from decimal import Decimal

class TransactionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear cuenta bancaria de prueba
        self.account = BankAccount.objects.create(
            user=self.user,
            plaid_account_id='test_account',
            name='Test Account',
            type='checking',
            balance=1000.00,
            currency='USD'
        )

    def test_create_transaction(self):
        """Test creating a new transaction"""
        url = reverse('transaction-list')
        data = {
            'account': self.account.id,
            'plaid_transaction_id': 'test_transaction_id',
            'amount': '50.00',
            'date': '2024-01-01',
            'name': 'Test Transaction',
            'payment_channel': 'online',
            'transaction_type': 'expense',
            'categoria_principal': 'Otros',
            'categoria_personalizada': 'Test Category'
        }
        print(f"Account ID being sent: {self.account.id}")
        response = self.client.post(url, data, format='json')
        
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(
            Transaction.objects.first().amount,
            Decimal('50.00')
        )

    def test_list_transactions(self):
        """Test listing transactions"""
        Transaction.objects.create(
            account=self.account,
            plaid_transaction_id='test_transaction_id',
            amount=100.00,
            date='2024-01-01',
            name='Test Transaction',
            payment_channel='online',
            transaction_type='expense',
            categoria_principal='Otros',
            categoria_personalizada='Test Category'
        )
        url = reverse('transaction-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
