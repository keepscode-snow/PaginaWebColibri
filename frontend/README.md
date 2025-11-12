# Sistema de Gestión Colibrí

Interfaz web en React para el sistema de ventas, control de stock y pedidos personalizados de la pastelería Colibrí. El diseño utiliza una paleta de rosa y verde pastel para replicar la atmósfera de la tienda física y facilitar la operación en pantallas táctiles.

## Características principales

- **Login con roles**: accesos diferenciados para Administradora (admin/admin123) y Cajera (cajero/cajero123).
- **Catálogo de productos**: búsqueda con autocompletar, filtros por categoría, alerta de stock bajo y edición de precios exclusiva para administración.
- **Ventas**: buscador rápido, carrito táctil, validación de número de boleta, actualización automática de stock y confirmaciones visuales.
- **Pedidos personalizados**: formulario completo con seguimiento de estado, filtros por fecha/estado y actualización ágil.
- **Reportes y dashboard**: KPIs diarios, gráfico Top 10 con rango de fechas, tablas exportables a CSV para ventas y pedidos.
- **Estilo responsive**: tarjetas con sombras suaves, botones grandes y tipografía legible para uso en mostrador.

## Scripts disponibles

```bash
npm install   # instala dependencias
npm run dev   # levanta el entorno de desarrollo en http://localhost:5173
npm run build # genera la versión lista para producción
```

## Estructura principal

```
src/
├── App.jsx
├── components/
├── context/
├── pages/
└── styles/
```

Cada módulo se separa por páginas y componentes reutilizables. Los contextos (`AuthContext`, `DataContext`) simulan la lógica básica de autenticación, catálogo, ventas y pedidos.
