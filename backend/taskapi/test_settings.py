from .settings import *

# Usar base de datos SQLite para tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:'
    }
}

# Deshabilitar caché para tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Configuración de Plaid para tests
PLAID_ENV = 'sandbox'
PLAID_CLIENT_ID = 'test_client_id'
PLAID_SECRET = 'test_secret'
