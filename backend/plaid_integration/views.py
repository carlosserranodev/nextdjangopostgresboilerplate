from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import PlaidService
from users.models import UserProfile
from transactions.models import Transaction
from accounts.models import BankAccount
from django.utils import timezone
from datetime import datetime
from django.db import transaction
from utils.constants import CATEGORY_MAPPING

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_link_token(request):
    """Crear un token de enlace para iniciar la conexión con Plaid"""
    try:
        plaid_service = PlaidService()
        link_token = plaid_service.create_link_token(request.user.id)
        return Response({'link_token': link_token})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exchange_public_token(request):
    """Intercambiar el token público y configurar las cuentas del usuario"""
    try:
        public_token = request.data.get('public_token')
        if not public_token:
            return Response(
                {'error': 'No public token provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        plaid_service = PlaidService()
        
        # Obtener access_token
        access_token, item_id = plaid_service.exchange_public_token(public_token)

        # Actualizar perfil de usuario
        user_profile = request.user.userprofile
        user_profile.plaid_access_token = access_token
        user_profile.last_sync = timezone.now()
        user_profile.save()

        # Obtener y guardar cuentas
        accounts = plaid_service.get_accounts(access_token)
        for account in accounts:
            BankAccount.objects.update_or_create(
                plaid_account_id=account['account_id'],
                user=request.user,
                defaults={
                    'name': account['name'],
                    'type': account['type'],
                    'balance': account['balances']['current'],
                    'currency': account['balances']['iso_currency_code'] or 'USD'
                }
            )

        return Response({'status': 'success', 'accounts_connected': len(accounts)})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_transactions(request):
    """Sincronizar transacciones desde Plaid"""
    try:
        user_profile = request.user.userprofile
        if not user_profile.plaid_access_token:
            return Response(
                {'error': 'No Plaid access token found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        plaid_service = PlaidService()
        
        # Obtener transacciones de Plaid
        transactions = plaid_service.get_transactions(user_profile.plaid_access_token)

        # Procesar transacciones en una transacción de base de datos
        with transaction.atomic():
            for plaid_transaction in transactions:
                # Obtener la cuenta asociada
                try:
                    account = BankAccount.objects.get(
                        user=request.user,
                        plaid_account_id=plaid_transaction['account_id']
                    )
                except BankAccount.DoesNotExist:
                    continue

                # Crear o actualizar la transacción
                Transaction.objects.update_or_create(
                    plaid_transaction_id=plaid_transaction['transaction_id'],
                    defaults={
                        'account': account,
                        'amount': plaid_transaction['amount'],
                        'date': datetime.strptime(
                            plaid_transaction['date'], '%Y-%m-%d'
                        ).date(),
                        'name': plaid_transaction['name'],
                        'merchant_name': plaid_transaction.get('merchant_name'),
                        'payment_channel': plaid_transaction['payment_channel'],
                        'transaction_type': 'expense' if plaid_transaction['amount'] > 0 else 'income',
                        'iso_currency_code': plaid_transaction.get('iso_currency_code', 'USD'),
                        'categoria_principal': determinar_categoria_principal(
                            plaid_transaction.get('personal_finance_category', {}).get('detailed', '')
                        ),
                        'categoria_personalizada': CATEGORY_MAPPING.get(
                            plaid_transaction.get('personal_finance_category', {}).get('detailed', ''),
                            'Otros'
                        )
                    }
                )

        # Actualizar última sincronización
        user_profile.last_sync = timezone.now()
        user_profile.save()

        return Response({
            'status': 'success',
            'transactions_processed': len(transactions)
        })
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_accounts(request):
    """Obtener las cuentas vinculadas del usuario"""
    try:
        accounts = BankAccount.objects.filter(user=request.user)
        data = [{
            'id': account.id,
            'name': account.name,
            'type': account.type,
            'balance': str(account.balance),
            'currency': account.currency
        } for account in accounts]
        return Response(data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disconnect_plaid(request):
    """Desconectar la integración con Plaid"""
    try:
        user_profile = request.user.userprofile
        if not user_profile.plaid_access_token:
            return Response(
                {'error': 'No Plaid connection found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        plaid_service = PlaidService()
        plaid_service.remove_item(user_profile.plaid_access_token)

        # Limpiar token de acceso
        user_profile.plaid_access_token = None
        user_profile.save()

        return Response({'status': 'success'})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )