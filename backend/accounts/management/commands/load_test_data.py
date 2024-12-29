import json
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import BankAccount
from transactions.models import Transaction
from categories.models import Category
from datetime import datetime

class Command(BaseCommand):
    help = 'Carga datos de prueba desde el archivo dataframe.json'

    def handle(self, *args, **options):
        # Crear usuario de prueba si no existe
        user, created = User.objects.get_or_create(
            username='test@example.com',
            email='test@example.com',
            defaults={'is_active': True}
        )
        if created:
            user.set_password('test1234')
            user.save()
            self.stdout.write(self.style.SUCCESS('Usuario de prueba creado'))

        # Cargar el archivo JSON
        with open('utils/dataframe.json', 'r') as file:
            data = json.load(file)

        # Crear cuentas únicas como BankAccount
        accounts = {}
        for account_id in set(data['account_id'].values()):
            account = BankAccount.objects.create(
                user=user,
                plaid_account_id=account_id,
                name=f'Cuenta {account_id[:8]}',
                type='checking',
                balance=0,
                currency='USD'
            )
            accounts[account_id] = account
            self.stdout.write(f'Cuenta creada: {account.name}')

        # Crear transacciones
        for i in range(len(data['account_id'])):
            account_id = data['account_id'][str(i)]
            amount = float(data['amount'][str(i)])
            date_str = data['date'][str(i)]
            date = datetime.fromtimestamp(int(date_str)/1000).date()  # Convertimos a solo fecha
            name = data['name'][str(i)]
            merchant_name = data['merchant_name'][str(i)]
            cat_principal = data['categoria_principal'][str(i)]
            cat_personalizada = data['categoria_personalizada'][str(i)]

            Transaction.objects.create(
                account=accounts[account_id],
                plaid_transaction_id=f'test_tx_{i}',  # ID único para pruebas
                amount=amount,
                date=date,
                name=name,
                merchant_name=merchant_name,
                payment_channel='online',  # Valor por defecto
                transaction_type='special',  # Valor por defecto
                iso_currency_code='USD',
                categoria_principal=cat_principal,
                categoria_personalizada=cat_personalizada
            )
            
            if i % 100 == 0:  # Mostrar progreso cada 100 transacciones
                self.stdout.write(f'Creadas {i} transacciones...')

        # Actualizar balances de las cuentas
        for account in accounts.values():
            transactions = Transaction.objects.filter(account=account)
            balance = sum(t.amount for t in transactions)
            account.balance = balance
            account.save()
            self.stdout.write(f'Balance actualizado para {account.name}: {balance}')

        self.stdout.write(self.style.SUCCESS('Datos de prueba cargados exitosamente'))



# docker-compose exec backend python manage.py load_test_data