from django.contrib import admin
from .models import Categoria, Producto, Venta, DetalleVenta, Pedido, Usuario
from django.contrib.auth.admin import UserAdmin

# Register your models here.

class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
    search_fields = ('nombre',)

class ProductoAdmin(admin.ModelAdmin):
    list_display = ('sku', 'nombre', 'precio', 'stock', 'activo', 'categoria', 'created_at', 'updated_at')
    list_filter = ('activo', 'categoria')
    search_fields = ('nombre', 'sku')

class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1

class VentaAdmin(admin.ModelAdmin):
    list_display = ('numero_boleta', 'fecha', 'total', 'medio_pago', 'creado_por')
    list_filter = ('fecha', 'medio_pago')
    search_fields = ('numero_boleta',)
    inlines = [DetalleVentaInline]

class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente_nombre', 'cliente_telefono', 'fecha_entrega', 'anticipo', 'total', 'estado', 'creado_por')
    list_filter = ('estado', 'fecha_entrega')
    search_fields = ('cliente_nombre', 'cliente_telefono')

class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ('username', 'email', 'first_name', 'last_name', 'rol', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Rol', {'fields': ('rol',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Rol', {'fields': ('rol',)}),
    )



admin.site.register(Categoria, CategoriaAdmin)
admin.site.register(Producto, ProductoAdmin)
admin.site.register(Venta, VentaAdmin)
admin.site.register(Pedido, PedidoAdmin)
admin.site.register(DetalleVenta)
admin.site.register(Usuario, UsuarioAdmin)

