from django.db import models
from django.contrib.auth.models import User
from utils.constants import MAIN_CATEGORIES

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=MAIN_CATEGORIES)
    is_principal = models.BooleanField(default=False)
    plaid_category_id = models.CharField(max_length=200, null=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#000000')

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.type})"