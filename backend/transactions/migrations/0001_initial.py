# Generated by Django 5.0.1 on 2024-12-16 23:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plaid_transaction_id', models.CharField(max_length=200, unique=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('date', models.DateField()),
                ('name', models.CharField(max_length=200)),
                ('merchant_name', models.CharField(blank=True, max_length=200, null=True)),
                ('payment_channel', models.CharField(choices=[('online', 'Online'), ('in store', 'In Store'), ('other', 'Other')], max_length=20)),
                ('transaction_type', models.CharField(max_length=50)),
                ('website', models.URLField(blank=True, null=True)),
                ('iso_currency_code', models.CharField(default='USD', max_length=3)),
                ('categoria_principal', models.CharField(max_length=50)),
                ('categoria_personalizada', models.CharField(max_length=50)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.bankaccount')),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
    ]
