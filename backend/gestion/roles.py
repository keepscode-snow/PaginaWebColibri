from functools import wraps
from django.http import HttpResponseForbidden
from django.contrib.auth.models import Group, Permission
from django.db.models.signals import post_migrate
from django.dispatch import receiver

def role_required(roles):
    roles = set(roles)
    def deco(view):
        @wraps(view)
        def _w(req,*a,**k):
            if not req.user.is_authenticated:
                from django.contrib.auth.views import redirect_to_login
                return redirect_to_login(req.get_full_path())
            if req.user.is_superuser:
                return view(req,*a,**k)
            user_groups = set(req.user.groups.values_list('name', flat=True))
            if roles & user_groups:
                return view(req,*a,**k)
            return HttpResponseForbidden('No tienes permisos para acceder aquí')
        return _w
    return deco

# --- Semilla de roles y permisos (reutilizable) ---
def seed_roles_and_permissions():
    # Crea grupos
    admin, _ = Group.objects.get_or_create(name='ADMIN')
    caja,  _ = Group.objects.get_or_create(name='CAJA')

    # Todos los permisos de la app 'ventas'
    all_perms = Permission.objects.filter(content_type__app_label='ventas')

    # Permisos mínimos del cajero (ajusta si tu app tiene más/menos modelos)
    allowed_caja = {
        'view_categoria',
        'view_producto',
        'view_pedido',      'add_pedido',      # si dejas crear pedidos desde caja
        'add_venta',        'view_venta',
        'add_detalleventa', 'view_detalleventa',
    }
    caja_perms = all_perms.filter(codename__in=allowed_caja)

    admin.permissions.set(all_perms)
    caja.permissions.set(caja_perms)

# Corre automáticamente después de migrate
@receiver(post_migrate)
def ensure_roles(sender, **kwargs):
    try:
        seed_roles_and_permissions()
    except Exception:
        # En un primer migrate puede no existir todo aún; queda estable al siguiente arranque.
        pass
