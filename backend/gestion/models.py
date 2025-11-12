from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class Usuario(AbstractUser):
    ROLES = [
        ('admin', 'Administrador'),
        ('cajero', 'Cajero'),
    ]
    rol = models.CharField(max_length=10, choices=ROLES, default='cajero')

    # Evitar conflictos con Group y Permission reverse accessors
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
        help_text='Los grupos a los que pertenece este usuario.',
        verbose_name='grupos'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_set',
        blank=True,
        help_text='Permisos específicos para este usuario.',
        verbose_name='permisos de usuario'
    )

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"




class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    sku = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    activo = models.BooleanField(default=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} (SKU: {self.sku})"

    def is_in_stock(self):
        return self.stock > 0


class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    medio_pago = models.CharField(max_length=50, default='Efectivo')
    numero_boleta = models.IntegerField(unique=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='ventas')

    def __str__(self):
        return f"Venta #{self.numero_boleta} - Total: ${self.total}"


class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"


class Pedido(models.Model):
    ESTADOS = [
        ("BORRADOR", "Borrador"),
        ("CONFIRMADO", "Confirmado"),
        ("LISTO", "Listo"),
        ("ENTREGADO", "Entregado"),
    ]

    cliente_nombre = models.CharField(max_length=100)
    cliente_telefono = models.CharField(max_length=15)
    fecha_entrega = models.DateTimeField()
    anticipo = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=15, choices=ESTADOS, default="BORRADOR")
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='pedidos')

    def __str__(self):
        return f"Pedido #{self.id} - Cliente: {self.cliente_nombre} - Estado: {self.estado}"



    

    
