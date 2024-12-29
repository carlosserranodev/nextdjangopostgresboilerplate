from django.core.cache import cache
from functools import wraps
from django.utils.decorators import method_decorator
from rest_framework.response import Response
import hashlib
import json

def cache_response(timeout=None, key_prefix=''):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(view_instance, request, *args, **kwargs):
            # Generar clave única basada en el usuario, método y parámetros
            cache_key = generate_cache_key(request, key_prefix, args, kwargs)
            
            # Intentar obtener del caché
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                return Response(cached_response)
            
            # Si no está en caché, ejecutar la vista
            response = view_func(view_instance, request, *args, **kwargs)
            
            # Guardar en caché
            if timeout:
                cache.set(cache_key, response.data, timeout)
            else:
                cache.set(cache_key, response.data)
            
            return response
        return _wrapped_view
    return decorator

def generate_cache_key(request, prefix, args, kwargs):
    """Genera una clave única para el caché basada en la petición"""
    key_parts = [
        prefix,
        str(request.user.id),
        request.method,
        request.path,
        json.dumps(dict(request.GET), sort_keys=True),
        json.dumps(args, sort_keys=True),
        json.dumps(kwargs, sort_keys=True),
    ]
    key_string = ':'.join(key_parts)
    return f'view_cache:{hashlib.md5(key_string.encode()).hexdigest()}'
