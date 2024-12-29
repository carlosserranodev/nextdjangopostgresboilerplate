import plaid
import json
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
import pandas as pd
from datetime import datetime, timedelta, date
import urllib3
import certifi
import time
import matplotlib.pyplot as plt
import json
import plotly.express as px
from IPython.display import display, HTML


# Deshabilitar advertencias de verificación SSL (solo para pruebas rápidas)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuración del cliente Plaid
PLAID_CLIENT_ID = '6747442bc33b04001a5b6e63'  # Reemplaza con tu CLIENT ID
PLAID_SECRET = 'd7692a7630000f1860b136f34ed031'  
PLAID_ENV = 'development'  # Cambia a 'development' o 'production' cuando sea necesario.

# Definir el entorno Plaid
if PLAID_ENV == 'sandbox':
    host = 'https://sandbox.plaid.com'
elif PLAID_ENV == 'development':
    host = 'https://development.plaid.com'
elif PLAID_ENV == 'production':
    host = 'https://production.plaid.com'
else:
    raise ValueError("El valor de PLAID_ENV debe ser 'sandbox', 'development' o 'production'")

configuration = Configuration(
    host=host,
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
    },
    ssl_ca_cert=certifi.where()  # Usar certificados raíz confiables
)
api_client = ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

# Método para crear un token de enlace (Link token)
def create_link_token():
    request = LinkTokenCreateRequest(
        user={
            'client_user_id': "unique_user_id"
        },
        client_name="Finance Analysis App",
        products=[Products('transactions')], 
        country_codes=[CountryCode('US')],
        language='en'
    )
    response = client.link_token_create(request)
    link_token = response['link_token']
    return link_token


# Método para intercambiar el public_token por el access_token
def get_access_token(public_token):
    request = ItemPublicTokenExchangeRequest(public_token=public_token)
    response = client.item_public_token_exchange(request)
    access_token = response['access_token']
    item_id = response['item_id']
    return access_token, item_id

# Método para obtener transacciones con reintentos automáticos
def get_transactions_with_retries(access_token, max_retries=10, initial_delay=20):
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
            response = client.transactions_get(request)

            transactions = response['transactions']
            total_transactions = response['total_transactions']

            # Continuar solicitando las transacciones hasta obtenerlas todas
            while len(transactions) < total_transactions:
                request = TransactionsGetRequest(
                    access_token=access_token,
                    start_date=start_date,
                    end_date=end_date,
                    offset=len(transactions)
                )
                response = client.transactions_get(request)
                transactions.extend(response['transactions'])

            return transactions

        except plaid.exceptions.ApiException as e:
            if "PRODUCT_NOT_READY" in str(e):
                print(f"Producto no listo (intento {attempt + 1}/{max_retries}). Reintentando en {delay} segundos...")
                time.sleep(delay)
                delay *= 1.5  # Incrementa el tiempo de espera para el próximo intento
            else:
                raise e

    raise Exception("No se pudo obtener las transacciones después de varios intentos.")

# Método para obtener un public_token en Sandbox sin frontend
def get_sandbox_public_token():
    request = SandboxPublicTokenCreateRequest(
        institution_id='ins_109508',  # Una institución ficticia de Plaid (puedes cambiarla si lo deseas)
        initial_products=[Products('transactions')]
    )
    response = client.sandbox_public_token_create(request)
    public_token = response['public_token']
    return public_token

# Ejemplo de cómo usar las funciones anteriores
# Primero crea un link token para usar con el frontend y luego obtén el access token
link_token = create_link_token()
print(f"Link Token (para frontend si fuera necesario): {link_token}")

# Obtener el `public_token` desde Sandbox (sin frontend)
public_token = get_sandbox_public_token()
print(f"Public Token (desde Sandbox): {public_token}")

# Intercambiar el public_token por el access_token
access_token, item_id = get_access_token(public_token)
print(f"Access Token: {access_token}")

# Obtener transacciones con reintentos automáticos
transactions = get_transactions_with_retries(access_token)

# Convertir transacciones a un DataFrame de pandas
transactions_df = pd.DataFrame(transactions)


# Convertir cada transacción en un diccionario
flattened_transactions = [transaction.to_dict() for transaction in transactions]

# Crear un DataFrame con las transacciones aplanadas
transactions_df = pd.DataFrame(flattened_transactions)

# Seleccionar solo las columnas necesarias
columns_to_keep = [
    "account_id",
    "amount",
    "date",
    "category",
    "iso_currency_code",
    "merchant_name",
    "name",
    "payment_channel",
    "personal_finance_category",
    "transaction_type",
    "website"
]
df_cleaned = transactions_df[columns_to_keep]
import pandas as pd
import ast  # Para interpretar cadenas como diccionarios o listas

df = df_cleaned
# Función para expandir una columna que contiene listas en formato string
def expand_list_column(df, column_name):
    # Intentar interpretar la columna como lista
    def parse_value(value):
        try:
            if isinstance(value, str):
                parsed = ast.literal_eval(value)
                if isinstance(parsed, list):
                    return parsed
            return value
        except (ValueError, SyntaxError):
            return value

    df[column_name] = df[column_name].apply(parse_value)

    # Si la columna contiene listas, crear columnas para cada índice
    if df[column_name].apply(lambda x: isinstance(x, list)).any():
        max_len = df[column_name].apply(lambda x: len(x) if isinstance(x, list) else 0).max()
        for i in range(max_len):
            df[f"{column_name}_{i}"] = df[column_name].apply(lambda x: x[i] if isinstance(x, list) and len(x) > i else None)

    # Crear una columna concatenada opcional
    df[f"{column_name}_concatenated"] = df[column_name].apply(lambda x: ", ".join(x) if isinstance(x, list) else x)

    return df

# Función para expandir una columna que contiene diccionarios en formato string
def expand_dict_column(df, column_name):
    # Intentar interpretar la columna como diccionario
    def parse_value(value):
        try:
            if isinstance(value, str):
                parsed = ast.literal_eval(value)
                if isinstance(parsed, dict):
                    return parsed
            return value
        except (ValueError, SyntaxError):
            return value

    df[column_name] = df[column_name].apply(parse_value)

    # Si la columna contiene diccionarios, expandirlas en nuevas columnas
    if df[column_name].apply(lambda x: isinstance(x, dict)).any():
        expanded_cols = pd.json_normalize(df[column_name])
        expanded_cols.columns = [f"{column_name}_{col}" for col in expanded_cols.columns]
        df = pd.concat([df, expanded_cols], axis=1)

    return df

# Expandir las columnas específicas 'category' y 'category_personal_finance'
df = expand_list_column(df, 'category')
df = expand_dict_column(df, 'personal_finance_category')

# Identificar otras columnas que puedan contener listas o diccionarios
columns_to_expand = [col for col in df.columns if df[col].astype(str).str.startswith('[').any() or df[col].astype(str).str.startswith('{').any()]

# Expandir todas las columnas relevantes
for col in columns_to_expand:
    if col not in ['category', 'personal_finance_category']:  # Evitar repetir columnas ya expandidas
        if df[col].astype(str).str.startswith('[').any():
            df = expand_list_column(df, col)
        elif df[col].astype(str).str.startswith('{').any():
            df = expand_dict_column(df, col)

df.drop(columns=["category", "personal_finance_category"], axis=1, inplace=True)



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


# Función para asignar categoría principal
def determinar_categoria_principal(detalle):
    if "INCOME" in detalle:
        return "Ingresos"
    elif detalle.startswith("RENT") or detalle.startswith("UTILITIES") or detalle.startswith("FOOD_AND_DRINK_GROCERIES"):
        return "Hogar"
    elif detalle.startswith("TRANSPORTATION"):
        return "Transporte"
    elif detalle.startswith("FOOD_AND_DRINK") or detalle.startswith("ENTERTAINMENT") or detalle.startswith("TRAVEL"):
        return "Ocio"
    elif detalle.startswith("TRANSFER_IN") or detalle.startswith("TRANSFER_OUT"):
        return "Transferencias"
    elif detalle.startswith("LOAN_PAYMENTS") or detalle.startswith("BANK_FEES"):
        return "Deudas"
    else:
        return "Otros"

# Función para asignar categoría personalizada
def asignar_categoria_personalizada(detalle, mapping):
    return mapping.get(detalle, "Categoría desconocida")

# Función principal para procesar el DataFrame
def procesar_transacciones(df, mapping):
    # Asegurarse de que la columna 'personal_finance_category_detailed' exista
    if "personal_finance_category_detailed" not in df.columns:
        raise ValueError("El DataFrame no contiene la columna 'personal_finance_category_detailed'")
    
    # Crear columnas con categorías principal y personalizada
    df['categoria_principal'] = df['personal_finance_category_detailed'].apply(determinar_categoria_principal)
    df['categoria_personalizada'] = df['personal_finance_category_detailed'].apply(lambda x: asignar_categoria_personalizada(x, mapping))
    
    return df

# Procesar el DataFrame con tu diccionario de mapeo
df_categorizado = procesar_transacciones(df, mapping)
# Lista de columnas a eliminar
columns_to_drop = [
    "personal_finance_category_primary",
    "personal_finance_category_detailed",
    "personal_finance_category_confidence_level",
    "category_0",
    "category_1",
    "category_2",
    "category_concatenated"
]

# Eliminar las columnas del DataFrame
df_categorizado = df_categorizado.drop(columns=columns_to_drop)

df_categorizado.to_json('dataframe.json')

df_json = df_categorizado.to_json()
df_json

