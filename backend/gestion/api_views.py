from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
from django.utils import timezone
from .models import Producto, Venta, DetalleVenta, Pedido
from .serializers import (
    ProductoSerializer,
    VentaSerializer,
    VentaCreateSerializer,
    PedidoSerializer,
    PedidoCreateSerializer,
)
from django.shortcuts import get_object_or_404
from django.db.models import Sum


class ProductoListView(ListAPIView):
    queryset = Producto.objects.filter(activo=True).order_by('nombre')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

class ProductoUpdateView(UpdateAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAdminUser]

class VentaCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = VentaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data['items']
        medio_pago = serializer.validated_data.get('medio_pago', 'Efectivo')
        numero_boleta = serializer.validated_data.get('numero_boleta')

        # Autogenerar boleta si no viene
        if not numero_boleta:
            ultimo = Venta.objects.order_by('-numero_boleta').first()
            numero_boleta = (ultimo.numero_boleta + 1) if ultimo else 1

        # Verificar boleta única
        if Venta.objects.filter(numero_boleta=numero_boleta).exists():
            return Response({'detail': 'Número de boleta ya utilizado.'}, status=status.HTTP_400_BAD_REQUEST)

        venta = Venta.objects.create(
            numero_boleta=numero_boleta,
            total=0,
            medio_pago=medio_pago,
            creado_por=request.user,
            fecha=timezone.now()
        )

        total_venta = 0

        for item in items:
            producto_id = item['producto_id']
            cantidad = item['cantidad']
            precio_en_venta = item['precio_en_venta']

            try:
                producto = Producto.objects.select_for_update().get(pk=producto_id)
            except Producto.DoesNotExist:
                transaction.set_rollback(True)
                return Response({'detail': f'Producto {producto_id} no existe.'}, status=status.HTTP_400_BAD_REQUEST)

            if producto.stock < cantidad:
                transaction.set_rollback(True)
                return Response({'detail': f'Stock insuficiente para {producto.nombre}.'}, status=status.HTTP_400_BAD_REQUEST)

            DetalleVenta.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio_en_venta
            )

            total_venta += cantidad * precio_en_venta
            producto.stock -= cantidad
            producto.save()

        venta.total = total_venta
        venta.save()

        return Response(VentaSerializer(venta).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'username': user.username,
        'is_staff': user.is_staff,
        'rol': getattr(user, 'rol', None),
    })

class PedidoListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_staff:
            pedidos = Pedido.objects.all().order_by('-fecha_entrega')
        else:
            pedidos = Pedido.objects.filter(creado_por=request.user).order_by('-fecha_entrega')
        return Response(PedidoSerializer(pedidos, many=True).data)

    def post(self, request):
        data = request.data.copy()
        serializer = PedidoCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        estado = v.get('estado') or 'BORRADOR'
        pedido = Pedido.objects.create(
            cliente_nombre=v['cliente_nombre'],
            cliente_telefono=v.get('cliente_telefono', ''),
            fecha_entrega=v['fecha_entrega'],
            anticipo=v['anticipo'],
            total=v.get('total', v['anticipo']),
            estado=estado,
            creado_por=request.user,
        )
        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

class PedidoUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        pedido = get_object_or_404(Pedido, pk=pk)
        if not (request.user.is_staff or pedido.creado_por_id == request.user.id):
            return Response({'detail': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        estado = request.data.get('estado')
        permitidos = {"BORRADOR", "CONFIRMADO", "LISTO", "ENTREGADO"}
        if estado and estado in permitidos:
            pedido.estado = estado
            pedido.save()
        return Response(PedidoSerializer(pedido).data)

class ReportVentasAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Venta.objects.all().order_by('-fecha')
        start = request.GET.get('start')
        end = request.GET.get('end')
        if start:
            qs = qs.filter(fecha__date__gte=start)
        if end:
            qs = qs.filter(fecha__date__lte=end)
        data = [
            {
                'id': v.id,
                'fecha': v.fecha.isoformat(),
                'total': float(v.total),
                'numero_boleta': v.numero_boleta,
            }
            for v in qs
        ]
        return Response(data)

class ReportTopProductosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start = request.GET.get('start')
        end = request.GET.get('end')
        detalles = DetalleVenta.objects.select_related('producto')
        if start:
            detalles = detalles.filter(venta__fecha__date__gte=start)
        if end:
            detalles = detalles.filter(venta__fecha__date__lte=end)
        agg = (
            detalles.values('producto__nombre')
            .annotate(sold=Sum('cantidad'))
            .order_by('-sold')[:10]
        )
        data = [{'name': it['producto__nombre'], 'sold': it['sold'] or 0} for it in agg]
        return Response(data)
