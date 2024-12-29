from rest_framework import serializers
from .models import BankAccount, Account

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'plaid_account_id', 'name', 'type', 'balance', 
                 'currency', 'last_sync', 'created_at', 'is_active']
        read_only_fields = ['user']


    

# Mantener el BankAccountSerializer existente y añadir:

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'type', 'balance', 'currency', 
                 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return Account.objects.create(user=user, **validated_data)
    
