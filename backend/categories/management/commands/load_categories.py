from django.core.management.base import BaseCommand
from categories.models import Category
from utils.constants import CATEGORY_MAPPING, MAIN_CATEGORIES

class Command(BaseCommand):
    help = 'Carga las categorías predefinidas en la base de datos'

    def handle(self, *args, **kwargs):
        # Crear categorías principales
        for category_type, _ in MAIN_CATEGORIES:
            Category.objects.get_or_create(
                name=category_type,
                type=category_type,
                is_principal=True
            )

        # Crear categorías personalizadas
        unique_categories = set(CATEGORY_MAPPING.values())
        for category_name in unique_categories:
            # Determinar el tipo principal basado en la lógica de tu mapping
            category_type = 'Otros'  # Por defecto
            if 'Ingresos' in category_name:
                category_type = 'Ingresos'
            elif any(word in category_name for word in ['Hogar', 'Servicios']):
                category_type = 'Hogar'
            # ... añadir más lógica según necesites

            Category.objects.get_or_create(
                name=category_name,
                type=category_type,
                is_principal=False
            )

        self.stdout.write(self.style.SUCCESS('Categorías cargadas exitosamente'))
