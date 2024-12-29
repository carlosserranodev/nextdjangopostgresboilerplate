# Generated by Django 5.0.1 on 2024-12-16 23:23

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(choices=[('Ingresos', 'Ingresos'), ('Hogar', 'Hogar'), ('Transporte', 'Transporte'), ('Ocio', 'Ocio'), ('Transferencias', 'Transferencias'), ('Deudas', 'Deudas'), ('Otros', 'Otros')], max_length=20)),
                ('is_principal', models.BooleanField(default=False)),
                ('plaid_category_id', models.CharField(blank=True, max_length=200, null=True)),
                ('icon', models.CharField(blank=True, max_length=50)),
                ('color', models.CharField(default='#000000', max_length=7)),
            ],
            options={
                'verbose_name_plural': 'Categories',
                'ordering': ['name'],
            },
        ),
    ]