from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'account', 'plaid_transaction_id', 'amount', 
            'date', 'name', 'merchant_name', 'payment_channel', 
            'transaction_type', 'website', 'iso_currency_code', 
            'categoria_principal', 'categoria_personalizada'
        ]

    def create(self, validated_data):
        # Asegurarnos de que account está presente
        if 'account' not in validated_data:
            raise serializers.ValidationError({"account": "This field is required."})
        return super().create(validated_data)