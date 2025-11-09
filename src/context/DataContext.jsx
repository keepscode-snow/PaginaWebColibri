import React, { createContext, useContext, useMemo, useState } from 'react';
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';

const DataContext = createContext();

const initialProducts = [
  { sku: 'PAST-001', name: 'Pastel de Vainilla', category: 'Pasteles', price: 18.5, stock: 12, sold: 86 },
  { sku: 'PAST-002', name: 'Pastel Red Velvet', category: 'Pasteles', price: 24.0, stock: 6, sold: 112 },
  { sku: 'TORT-010', name: 'Torta Tres Leches', category: 'Tortas', price: 28.5, stock: 4, sold: 98 },
  { sku: 'GALL-021', name: 'Galletas de Mantequilla', category: 'Galletas', price: 8.5, stock: 35, sold: 152 },
  { sku: 'CHOC-005', name: 'Bombones de Frambuesa', category: 'Chocolates', price: 12.0, stock: 20, sold: 75 },
  { sku: 'CHOC-008', name: 'Tableta 70% Cacao', category: 'Chocolates', price: 9.75, stock: 10, sold: 54 },
  { sku: 'POST-012', name: 'Cheesecake de Maracuyá', category: 'Pasteles', price: 22.5, stock: 5, sold: 65 },
  { sku: 'GALL-030', name: 'Macarons Surtidos', category: 'Galletas', price: 15.0, stock: 8, sold: 130 },
  { sku: 'POST-040', name: 'Mousse de Chocolate', category: 'Postres', price: 14.0, stock: 9, sold: 48 },
  { sku: 'POST-050', name: 'Cupcakes Personalizados', category: 'Postres', price: 16.0, stock: 15, sold: 102 }
];

const initialOrders = [
  {
    id: 'PED-001',
    clientName: 'Lucía Rojas',
    phone: '+56 9 1234 5678',
    deliveryDate: '2024-05-12T15:00',
    description: 'Torta fondant temática colibrí',
    deposit: 30000,
    status: 'pendiente'
  },
  {
    id: 'PED-002',
    clientName: 'Javier Soto',
    phone: '+56 9 8765 4321',
    deliveryDate: '2024-05-10T12:30',
    description: '50 cupcakes personalizados cumpleaños',
    deposit: 20000,
    status: 'entregado'
  }
];

export function DataProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);

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

  const closeSale = ({ receiptNumber }) => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setSales((prev) => [
      ...prev,
      {
        id: `SALE-${prev.length + 1}`,
        date: new Date().toISOString(),
        items: cart,
        receiptNumber,
        total
      }
    ]);

    setProducts((prev) =>
      prev.map((product) => {
        const cartItem = cart.find((item) => item.sku === product.sku);
        if (!cartItem) return product;
        return {
          ...product,
          stock: Math.max(product.stock - cartItem.quantity, 0),
          sold: product.sold + cartItem.quantity
        };
      })
    );

    clearCart();
    return { success: true, total };
  };

  const updateProductPrice = (sku, price) => {
    setProducts((prev) => prev.map((product) => (product.sku === sku ? { ...product, price } : product)));
  };

  const createOrder = (order) => {
    setOrders((prev) => [
      ...prev,
      {
        ...order,
        id: `PED-${String(prev.length + 1).padStart(3, '0')}`
      }
    ]);
  };

  const updateOrderStatus = (id, status) => {
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
    if (!startDate || !endDate) {
      return [...products]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
        .map((product) => ({ name: product.name, sold: product.sold }));
    }
    return sales
      .filter((sale) =>
        isWithinInterval(parseISO(sale.date), {
          start: parseISO(startDate),
          end: parseISO(endDate)
        })
      )
      .flatMap((sale) => sale.items)
      .reduce((acc, item) => {
        const existing = acc.find((p) => p.name === item.name);
        if (existing) {
          existing.sold += item.quantity;
        } else {
          acc.push({ name: item.name, sold: item.quantity });
        }
        return acc;
      }, [])
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
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
