from django.urls import path
from .api_views import (
    ProductoListView,
    ProductoUpdateView,
    VentaCreateAPIView,
    me,
    PedidoListCreateAPIView,
    PedidoUpdateAPIView,
    ReportVentasAPIView,
    ReportTopProductosAPIView,
)


urlpatterns = [
    path('productos/', ProductoListView.as_view(), name='api_productos_list'),
    path('productos/<int:pk>/', ProductoUpdateView.as_view(), name='api_productos_update'),
    path('ventas/', VentaCreateAPIView.as_view(), name='api_ventas_create'),
    path('me/', me, name='api_me'),
    path('pedidos/', PedidoListCreateAPIView.as_view(), name='api_pedidos_list_create'),
    path('pedidos/<int:pk>/', PedidoUpdateAPIView.as_view(), name='api_pedidos_update'),
    path('reportes/ventas/', ReportVentasAPIView.as_view(), name='api_reportes_ventas'),
    path('reportes/top-productos/', ReportTopProductosAPIView.as_view(), name='api_reportes_top_productos'),
]
