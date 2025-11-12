from rest_framework import serializers
from .models import Categoria, Producto, Venta, DetalleVenta, Pedido

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    class Meta:
        model = Producto
        fields = ['id','sku','nombre','categoria','categoria_nombre','precio','stock','activo']

class DetalleVentaCreateSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)
    precio_en_venta = serializers.DecimalField(max_digits=12, decimal_places=2)

class VentaSerializer(serializers.ModelSerializer):
    detalles = serializers.SerializerMethodField()
    class Meta:
        model = Venta
        fields = ['id','fecha','total','medio_pago','numero_boleta','creado_por','detalles']
        read_only_fields = ['id','fecha','creado_por','detalles']
    def get_detalles(self, obj):
        return [{
            "producto": d.producto.nombre,
            "sku": d.producto.sku,
            "cantidad": d.cantidad,
            "precio_en_venta": str(d.precio_en_venta),
            "subtotal": str(d.cantidad * d.precio_en_venta)
        } for d in obj.detalles.all()]

class VentaCreateSerializer(serializers.Serializer):
    numero_boleta = serializers.CharField(max_length=30)
    medio_pago = serializers.CharField(max_length=30)
    items = DetalleVentaCreateSerializer(many=True)

class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = ['id','cliente_nombre','cliente_telefono','fecha_entrega','anticipo','total','estado']

class PedidoCreateSerializer(serializers.Serializer):
    cliente_nombre = serializers.CharField(max_length=100)
    cliente_telefono = serializers.CharField(max_length=20, allow_blank=True, required=False)
    fecha_entrega = serializers.DateTimeField()
    anticipo = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    estado = serializers.CharField(max_length=15, required=False)
