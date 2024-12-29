from django.db import models
from django.contrib.auth.models import User

class BankAccount(models.Model):
    ACCOUNT_TYPES = [
        ('checking', 'Checking'),
        ('savings', 'Savings'),
        ('credit', 'Credit'),
        ('investment', 'Investment'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plaid_account_id = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    last_sync = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'plaid_account_id']

    def __str__(self):
        return f"{self.name} - {self.user.username}"
    

# Mantener el modelo BankAccount existente y añadir:

class Account(models.Model):
    ACCOUNT_TYPES = [
        ('checking', 'Cuenta Corriente'),
        ('savings', 'Cuenta de Ahorro'),
        ('credit', 'Tarjeta de Crédito'),
        ('investment', 'Cuenta de Inversión'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='manual_accounts')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.user.username} (Manual)"