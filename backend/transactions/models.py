from django.db import models
from accounts.models import BankAccount
from utils.constants import PAYMENT_CHANNELS

class Transaction(models.Model):
    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE)
    plaid_transaction_id = models.CharField(max_length=200, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    name = models.CharField(max_length=200)
    merchant_name = models.CharField(max_length=200, null=True, blank=True)
    payment_channel = models.CharField(max_length=20, choices=PAYMENT_CHANNELS)
    transaction_type = models.CharField(max_length=50)
    website = models.URLField(max_length=200, null=True, blank=True)
    iso_currency_code = models.CharField(max_length=3, default='USD')
    categoria_principal = models.CharField(max_length=50)
    categoria_personalizada = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.name} - {self.amount} {self.iso_currency_code}"