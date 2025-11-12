import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';
import { apiFetch } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await apiFetch('/api/productos/');
        const mapped = data.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.nombre,
          category: p.categoria_nombre || String(p.categoria),
          price: Number(p.precio),
          stock: p.stock,
          sold: 0,
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Error cargando productos:', err);
      }
      try {
        const pedidos = await apiFetch('/api/pedidos/');
        const mappedOrders = pedidos.map((p) => ({
          id: p.id,
          clientName: p.cliente_nombre,
          phone: p.cliente_telefono || '',
          deliveryDate: p.fecha_entrega,
          description: '',
          deposit: Number(p.anticipo),
          status: p.estado === 'ENTREGADO' ? 'entregado' : 'pendiente',
        }));
        setOrders(mappedOrders);
      } catch (err) {
        console.error('Error cargando pedidos:', err);
      }
      try {
        const ventas = await apiFetch('/api/reportes/ventas/');
        const mappedSales = ventas.map((v) => ({
          id: v.id,
          date: v.fecha,
          items: [],
          receiptNumber: v.numero_boleta,
          total: Number(v.total),
        }));
        setSales(mappedSales);
      } catch (err) {
        console.error('Error cargando ventas:', err);
      }
    })();
  }, [user]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (sku, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.sku !== sku));
    } else {
      setCart((prev) => prev.map((item) => (item.sku === sku ? { ...item, quantity } : item)));
    }
  };

  const clearCart = () => setCart([]);

  const closeSale = async ({ receiptNumber }) => {
    const items = cart.map((item) => ({
      producto_id: item.id,
      cantidad: item.quantity,
      precio_en_venta: item.price,
    }));
    const body = { numero_boleta: receiptNumber, medio_pago: 'Efectivo', items };
    const result = await apiFetch('/api/ventas/', { method: 'POST', body });
    try {
      const data = await apiFetch('/api/productos/');
      const mapped = data.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.nombre,
        category: p.categoria_nombre || String(p.categoria),
        price: Number(p.precio),
        stock: p.stock,
        sold: 0,
      }));
      setProducts(mapped);
    } catch {}
    clearCart();
    const sale = {
      id: result.id,
      date: result.fecha,
      items: items,
      receiptNumber: result.numero_boleta,
      total: Number(result.total),
    };
    setSales((prev) => [...prev, sale]);
    return { success: true, total: sale.total };
  };

  const updateProductPrice = async (sku, price) => {
    const product = products.find((p) => p.sku === sku);
    if (!product) return;
    await apiFetch(`/api/productos/${product.id}/`, { method: 'PATCH', body: { precio: price } });
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, price } : p)));
  };

  const createOrder = async (order) => {
    const estado = order.status === 'entregado' ? 'ENTREGADO' : 'CONFIRMADO';
    const body = {
      cliente_nombre: order.clientName,
      cliente_telefono: order.phone || '',
      fecha_entrega: order.deliveryDate,
      anticipo: Number(order.deposit || 0),
      total: Number(order.deposit || 0),
      estado,
    };
    const created = await apiFetch('/api/pedidos/', { method: 'POST', body });
    const mapped = {
      id: created.id,
      clientName: created.cliente_nombre,
      phone: created.cliente_telefono || '',
      deliveryDate: created.fecha_entrega,
      description: '',
      deposit: Number(created.anticipo),
      status: created.estado === 'ENTREGADO' ? 'entregado' : 'pendiente',
    };
    setOrders((prev) => [mapped, ...prev]);
  };

  const updateOrderStatus = async (id, status) => {
    const estado = status === 'entregado' ? 'ENTREGADO' : 'CONFIRMADO';
    await apiFetch(`/api/pedidos/${id}/`, { method: 'PATCH', body: { estado } });
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const getTodaySalesTotal = () => {
    const today = new Date();
    return sales
      .filter((sale) => differenceInDays(today, parseISO(sale.date)) === 0)
      .reduce((acc, sale) => acc + sale.total, 0);
  };

  const getLowStockProducts = () => products.filter((product) => product.stock <= 5);

  const getTopProducts = ({ startDate, endDate }) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    return apiFetch(`/api/reportes/top-productos/${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const value = useMemo(
    () => ({
      products,
      orders,
      sales,
      cart,
      addToCart,
      updateCartQuantity,
      clearCart,
      closeSale,
      updateProductPrice,
      createOrder,
      updateOrderStatus,
      getTodaySalesTotal,
      getLowStockProducts,
      getTopProducts
    }),
    [products, orders, sales, cart]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
