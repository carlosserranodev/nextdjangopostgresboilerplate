import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
import pandas as pd
from datetime import datetime, timedelta
import json
import time

# Configuración del cliente Plaid
PLAID_CLIENT_ID = '6747442bc33b04001a5b6e63'
PLAID_SECRET = 'd7692a7630000f1860b136f34ed031'
PLAID_ENV = 'sandbox'

# Configurar el host según el entorno
host = 'https://sandbox.plaid.com'

configuration = Configuration(
    host=host,
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
    }
)

client = plaid_api.PlaidApi(ApiClient(configuration))

# Diccionario de mapping para categorías
mapping = {
    # Categorías de ingresos
    "INCOME_WAGES": "Salarios",
    "INCOME_DIVIDENDS": "Ingresos financieros",
    "INCOME_INTEREST_EARNED": "Ingresos financieros",
    "INCOME_RETIREMENT_PENSION": "Otros ingresos",
    "INCOME_TAX_REFUND": "Otros ingresos",
    "INCOME_UNEMPLOYMENT": "Otros ingresos",
    "INCOME_OTHER_INCOME": "Otros ingresos",

    # Categorías de transferencias
    "TRANSFER_IN_CASH_ADVANCES_AND_LOANS": "Otros ingresos",
    "TRANSFER_IN_DEPOSIT": "Otros ingresos",
    "TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS": "Ingresos financieros",
    "TRANSFER_IN_SAVINGS": "Otros ingresos",
    "TRANSFER_IN_ACCOUNT_TRANSFER": "Otros ingresos",
    "TRANSFER_IN_OTHER_TRANSFER_IN": "Otros ingresos",
    "TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS": "Otros gastos del hogar",
    "TRANSFER_OUT_SAVINGS": "Otros gastos del hogar",
    "TRANSFER_OUT_WITHDRAWAL": "Otros gastos del hogar",
    "TRANSFER_OUT_ACCOUNT_TRANSFER": "Otros gastos del hogar",
    "TRANSFER_OUT_OTHER_TRANSFER_OUT": "Otros gastos del hogar",

    # Categorías de pagos de préstamos
    "LOAN_PAYMENTS_CAR_PAYMENT": "Préstamo coche",
    "LOAN_PAYMENTS_CREDIT_CARD_PAYMENT": "Créditos personales",
    "LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT": "Créditos personales",
    "LOAN_PAYMENTS_MORTGAGE_PAYMENT": "Hipoteca",
    "LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT": "Créditos personales",
    "LOAN_PAYMENTS_OTHER_PAYMENT": "Otros gastos del hogar",

    # Categorías de comisiones bancarias
    "BANK_FEES_ATM_FEES": "Otros gastos del hogar",
    "BANK_FEES_FOREIGN_TRANSACTION_FEES": "Otros gastos del hogar",
    "BANK_FEES_INSUFFICIENT_FUNDS": "Otros gastos del hogar",
    "BANK_FEES_INTEREST_CHARGE": "Otros gastos del hogar",
    "BANK_FEES_OVERDRAFT_FEES": "Otros gastos del hogar",
    "BANK_FEES_OTHER_BANK_FEES": "Otros gastos del hogar",

    # Categorías de entretenimiento
    "ENTERTAINMENT_CASINOS_AND_GAMBLING": "Entretenimiento",
    "ENTERTAINMENT_MUSIC_AND_AUDIO": "Entretenimiento",
    "ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS": "Entretenimiento",
    "ENTERTAINMENT_TV_AND_MOVIES": "Entretenimiento",
    "ENTERTAINMENT_VIDEO_GAMES": "Entretenimiento",
    "ENTERTAINMENT_OTHER_ENTERTAINMENT": "Entretenimiento",

    # Categorías de comida y bebida
    "FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR": "Comida",
    "FOOD_AND_DRINK_COFFEE": "Comida",
    "FOOD_AND_DRINK_FAST_FOOD": "Comida",
    "FOOD_AND_DRINK_GROCERIES": "Comida",
    "FOOD_AND_DRINK_RESTAURANT": "Comida",
    "FOOD_AND_DRINK_VENDING_MACHINES": "Comida",
    "FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK": "Comida",

    # Categorías de mercancía general
    "GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS": "Ropa",
    "GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES": "Ropa",
    "GENERAL_MERCHANDISE_CONVENIENCE_STORES": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_DEPARTMENT_STORES": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_DISCOUNT_STORES": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_ELECTRONICS": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES": "Regalos",
    "GENERAL_MERCHANDISE_OFFICE_SUPPLIES": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_ONLINE_MARKETPLACES": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_PET_SUPPLIES": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_SPORTING_GOODS": "Hobbies",
    "GENERAL_MERCHANDISE_SUPERSTORES": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_TOBACCO_AND_VAPE": "Otros gastos del hogar",
    "GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE": "Otros gastos del hogar",

    # Categorías de mejoras del hogar
    "HOME_IMPROVEMENT_FURNITURE": "Otros gastos del hogar",
    "HOME_IMPROVEMENT_HARDWARE": "Otros gastos del hogar",
    "HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE": "Otros gastos del hogar",
    "HOME_IMPROVEMENT_SECURITY": "Otros gastos del hogar",
    "HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT": "Otros gastos del hogar",

    # Categorías médicas
    "MEDICAL_DENTAL_CARE": "Cuidado personal",
    "MEDICAL_EYE_CARE": "Cuidado personal",
    "MEDICAL_NURSING_CARE": "Cuidado personal",
    "MEDICAL_PHARMACIES_AND_SUPPLEMENTS": "Cuidado personal",
    "MEDICAL_PRIMARY_CARE": "Cuidado personal",
    "MEDICAL_VETERINARY_SERVICES": "Cuidado personal",
    "MEDICAL_OTHER_MEDICAL": "Cuidado personal",

    # Categorías de cuidado personal
    "PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS": "Cuidado personal",
    "PERSONAL_CARE_HAIR_AND_BEAUTY": "Cuidado personal",
    "PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING": "Cuidado personal",
    "PERSONAL_CARE_OTHER_PERSONAL_CARE": "Cuidado personal",

    # Categorías de servicios generales
    "GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING": "Gastos de servicios básicos",
    "GENERAL_SERVICES_AUTOMOTIVE": "Otros gastos del hogar",
    "GENERAL_SERVICES_CHILDCARE": "Otros gastos del hogar",
    "GENERAL_SERVICES_CONSULTING_AND_LEGAL": "Otros gastos del hogar",
    "GENERAL_SERVICES_EDUCATION": "Otros gastos del hogar",
    "GENERAL_SERVICES_INSURANCE": "Otros seguros",
    "GENERAL_SERVICES_POSTAGE_AND_SHIPPING": "Otros gastos del hogar",
    "GENERAL_SERVICES_STORAGE": "Otros gastos del hogar",
    "GENERAL_SERVICES_OTHER_GENERAL_SERVICES": "Otros gastos del hogar",

    # Categorías gubernamentales y sin fines de lucro
    "GOVERNMENT_AND_NON_PROFIT_DONATIONS": "Regalos",
    "GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES": "Otros gastos del hogar",
    "GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT": "Otros gastos del hogar",
    "GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT": "Otros gastos del hogar",

    # Categorías de transporte
    "TRANSPORTATION_BIKES_AND_SCOOTERS": "Transporte",
    "TRANSPORTATION_GAS": "Gasolina",
    "TRANSPORTATION_PARKING": "Transporte",
    "TRANSPORTATION_PUBLIC_TRANSIT": "Transporte",
    "TRANSPORTATION_TAXIS_AND_RIDE_SHARES": "Transporte",
    "TRANSPORTATION_TOLLS": "Transporte",
    "TRANSPORTATION_OTHER_TRANSPORTATION": "Transporte",

    # Categorías de viajes
    "TRAVEL_FLIGHTS": "Viajes",
    "TRAVEL_LODGING": "Viajes",
    "TRAVEL_RENTAL_CARS": "Viajes",
    "TRAVEL_OTHER_TRAVEL": "Viajes",

    # Categorías de renta y servicios
    "RENT_AND_UTILITIES_GAS_AND_ELECTRICITY": "Gastos de servicios básicos",
    "RENT_AND_UTILITIES_INTERNET_AND_CABLE": "Gastos internet/TV",
    "RENT_AND_UTILITIES_RENT": "Alquiler",
    "RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT": "Gastos de servicios básicos",
    "RENT_AND_UTILITIES_TELEPHONE": "Gastos telefónicos",
    "RENT_AND_UTILITIES_WATER": "Gastos de servicios básicos",
    "RENT_AND_UTILITIES_OTHER_UTILITIES": "Gastos de servicios básicos",
}

def get_transaction_data(max_retries=5, initial_delay=5):
    # Obtener public_token de sandbox
    sandbox_request = SandboxPublicTokenCreateRequest(
        institution_id='ins_109508',
        initial_products=[Products('transactions')]
    )
    sandbox_response = client.sandbox_public_token_create(sandbox_request)
    public_token = sandbox_response['public_token']

    # Intercambiar public_token por access_token
    exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
    exchange_response = client.item_public_token_exchange(exchange_request)
    access_token = exchange_response['access_token']

    # Obtener transacciones con reintentos
    start_date = datetime.now().date() - timedelta(days=30)
    end_date = datetime.now().date()
    delay = initial_delay
    
    for attempt in range(max_retries):
        try:
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date
            )
            print(f"Intento {attempt + 1}: Obteniendo transacciones...")
            response = client.transactions_get(request)
            return response['transactions']
        except plaid.exceptions.ApiException as e:
            if "PRODUCT_NOT_READY" in str(e):
                if attempt < max_retries - 1:
                    print(f"Datos no listos. Esperando {delay} segundos...")
                    time.sleep(delay)
                    delay *= 2  # Incrementar el tiempo de espera
                else:
                    raise Exception("Máximo número de intentos alcanzado")
            else:
                raise e

def process_and_save_data():
    try:
        # Obtener transacciones
        transactions = get_transaction_data()
        
        # Convertir a DataFrame
        df = pd.DataFrame([t.to_dict() for t in transactions])
        
        # Extraer la categoría detallada del diccionario personal_finance_category
        df['categoria_personalizada'] = df['personal_finance_category'].apply(
            lambda x: mapping.get(x['detailed'], "Otros") if isinstance(x, dict) and 'detailed' in x else "Otros"
        )

        # 1. Distribución por Canal de Pago
        channel_distribution = df.groupby('payment_channel')['amount'].sum()
        channel_chart_data = {
            "labels": channel_distribution.index.tolist(),
            "datasets": [{
                "label": "Distribución por Canal de Pago",
                "data": channel_distribution.values.tolist(),
                "backgroundColor": [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)"
                ],
                "borderColor": [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)"
                ],
                "borderWidth": 1
            }]
        }

        # 2. Top Comercios por Gasto
        merchant_expenses = df.groupby(['merchant_name', 'categoria_personalizada'])['amount'].sum().reset_index()
        top_merchants = merchant_expenses.nlargest(10, 'amount')
        merchant_chart_data = {
            "labels": top_merchants['merchant_name'].tolist(),
            "datasets": [{
                "label": "Top Comercios por Gasto",
                "data": top_merchants['amount'].tolist(),
                "backgroundColor": "rgba(75, 192, 192, 0.2)",
                "borderColor": "rgba(75, 192, 192, 1)",
                "borderWidth": 1,
                "categories": top_merchants['categoria_personalizada'].tolist()
            }]
        }

        # 3. Tendencia de Gastos en el Tiempo
        df['date'] = pd.to_datetime(df['date'])
        time_trend = df.groupby(['date', 'categoria_personalizada'])['amount'].sum().reset_index()
        time_chart_data = {
            "labels": time_trend['date'].dt.strftime('%Y-%m-%d').unique().tolist(),
            "datasets": [{
                "label": "Tendencia de Gastos en el Tiempo",
                "data": time_trend['amount'].tolist(),
                "backgroundColor": "rgba(153, 102, 255, 0.2)",
                "borderColor": "rgba(153, 102, 255, 1)",
                "borderWidth": 1,
                "categories": time_trend['categoria_personalizada'].tolist()
            }]
        }

        # Combinar todos los datos
        combined_data = {
            "channel_distribution": channel_chart_data,
            "merchant_expenses": merchant_chart_data,
            "time_trend": time_chart_data
        }

        # Guardar en archivo JSON
        with open('financial_data.json', 'w') as f:
            json.dump(combined_data, f, indent=4)
        
        print("Archivo JSON generado como 'financial_data.json'")
    
    except Exception as e:
        print(f"Error durante el procesamiento: {str(e)}")
        raise

if __name__ == "__main__":
    process_and_save_data()