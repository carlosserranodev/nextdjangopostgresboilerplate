import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.item_remove_request import ItemRemoveRequest
from django.conf import settings
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
import certifi
from datetime import datetime, timedelta

class PlaidService:
    def __init__(self):
        configuration = Configuration(
            host=settings.PLAID_ENV,
            api_key={
                'clientId': settings.PLAID_CLIENT_ID,
                'secret': settings.PLAID_SECRET,
            },
            ssl_ca_cert=certifi.where()
        )
        api_client = ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)

    def create_link_token(self, user_id):
        """Crear un token de enlace para iniciar la conexión con Plaid"""
        try:
            request = LinkTokenCreateRequest(
                user={
                    'client_user_id': str(user_id)
                },
                client_name="Finance Analysis App",
                products=[Products('transactions')],
                country_codes=[CountryCode('US')],
                language='en',
                redirect_uri=settings.PLAID_REDIRECT_URI
            )
            response = self.client.link_token_create(request)
            return response['link_token']
        except plaid.ApiException as e:
            print(f"Error creating link token: {e}")
            raise

    def exchange_public_token(self, public_token):
        """Intercambiar el token público por un token de acceso"""
        try:
            request = ItemPublicTokenExchangeRequest(public_token=public_token)
            response = self.client.item_public_token_exchange(request)
            return response['access_token'], response['item_id']
        except plaid.ApiException as e:
            print(f"Error exchanging public token: {e}")
            raise

    def get_accounts(self, access_token):
        """Obtener información de las cuentas vinculadas"""
        try:
            request = AccountsGetRequest(access_token=access_token)
            response = self.client.accounts_get(request)
            return response['accounts']
        except plaid.ApiException as e:
            print(f"Error getting accounts: {e}")
            raise

    def get_transactions(self, access_token, start_date=None, end_date=None):
        """Obtener transacciones de las cuentas vinculadas"""
        if not start_date:
            start_date = datetime.now().date() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now().date()

        try:
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date
            )
            response = self.client.transactions_get(request)
            
            transactions = response['transactions']
            total_transactions = response['total_transactions']

            # Obtener todas las transacciones si hay más
            while len(transactions) < total_transactions:
                request = TransactionsGetRequest(
                    access_token=access_token,
                    start_date=start_date,
                    end_date=end_date,
                    offset=len(transactions)
                )
                response = self.client.transactions_get(request)
                transactions.extend(response['transactions'])

            return transactions
        except plaid.ApiException as e:
            print(f"Error getting transactions: {e}")
            raise

    def remove_item(self, access_token):
        """Eliminar la conexión con Plaid"""
        try:
            request = ItemRemoveRequest(access_token=access_token)
            response = self.client.item_remove(request)
            return response
        except plaid.ApiException as e:
            print(f"Error removing item: {e}")
            raise
