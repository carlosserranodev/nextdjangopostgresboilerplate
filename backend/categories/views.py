from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer
from utils.cache import cache_response

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    @cache_response(timeout=60*60, key_prefix='category_list')  # Cache por 1 hora
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @cache_response(timeout=60*60, key_prefix='category_detail')
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)