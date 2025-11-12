from django.urls import path
from . import views
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path('', views.home_redirect, name='home'),
    path('admin-dashboard/', views.dashboard_admin, name='dashboard_admin'),
    path('cajero-dashboard/', views.dashboard_cajero, name='dashboard_cajero'),

    path('login/', LoginView.as_view(template_name='gestion/login.html'), name='login'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),

    path('inicio/', views.menu_inicio, name='menu_inicio'),


    path('venta/', views.registrar_venta, name='registrar_venta'),
    path('venta/confirmar/', views.confirmar_venta, name='confirmar_venta'),
    path('venta/agregar/', views.agregar_al_carrito, name='agregar_al_carrito'),

    path('pedidos/', views.lista_pedidos, name='lista_pedidos'),
    path('pedido/nuevo/', views.registrar_pedido, name='registrar_pedido'),
    path('pedidos/<int:pedido_id>/cambiar_estado/', views.cambiar_estado_pedido, name='cambiar_estado_pedido'),
    path('pedidos-admin/', views.lista_pedidos_admin, name='lista_pedidos_admin'),
    path('pedidos-admin/<int:pedido_id>/cambiar_estado/', views.admin_cambiar_estado_pedido, name='admin_cambiar_estado_pedido'),
    path('pedidos-admin/exportar/', views.exportar_pedidos_excel, name='exportar_pedidos_excel'),

    # Gestión de productos desde frontend (admin)
    path('productos/', views.lista_productos_admin, name='lista_productos_admin'),
    path('productos/nuevo/', views.crear_producto, name='crear_producto'),
    path('productos/<int:producto_id>/editar/', views.editar_producto, name='editar_producto'),
    path('productos/<int:producto_id>/eliminar/', views.eliminar_producto, name='eliminar_producto'),




]




