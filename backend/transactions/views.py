from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer
from utils.cache import cache_response
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(account__user=self.request.user)

    @cache_response(timeout=60*15, key_prefix='transaction_list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @cache_response(timeout=60*15, key_prefix='transaction_detail')
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    @cache_response(timeout=60*5, key_prefix='recent_transactions')
    def recent(self, request):
        recent_date = timezone.now() - timedelta(days=7)
        transactions = self.get_queryset().filter(
            date__gte=recent_date
        ).order_by('-date')[:10]
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)