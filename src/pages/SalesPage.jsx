import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import styles from './SalesPage.module.css';

export default function SalesPage() {
  const { products, cart, addToCart, updateCartQuantity, closeSale } = useData();
  const [search, setSearch] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [message, setMessage] = useState(null);

  const suggestions = useMemo(() => {
    if (!search) return [];
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 6);
  }, [products, search]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleAddProduct = (product) => {
    addToCart(product);
    setSearch('');
  };

  const handleSale = () => {
    if (!receiptNumber.trim()) {
      setMessage({ type: 'error', text: 'Debes ingresar el número de boleta.' });
      return;
    }
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Agrega productos al carrito.' });
      return;
    }
    const result = closeSale({ receiptNumber });
    setMessage({
      type: 'success',
      text: `Venta registrada correctamente. Total $${result.total.toLocaleString('es-CL')}`
    });
    setReceiptNumber('');
  };

  return (
    <div className={styles.sales}>
      <section className={styles.addProduct}>
        <label>
          Busca por nombre o SKU
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej: Pastel, TORT-010"
          />
        </label>
        {search && suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((product) => (
              <button key={product.sku} onClick={() => handleAddProduct(product)}>
                <div>
                  <strong>{product.name}</strong>
                  <span className={styles.sku}>SKU {product.sku}</span>
                </div>
                <span>${product.price.toLocaleString('es-CL')}</span>
              </button>
            ))}
          </div>
        )}
      </section>
      <section className={styles.cart}>
        <header>
          <div>
            <h3>Carrito de venta</h3>
            <p className={styles.caption}>Verifica cantidades y stock disponible antes de cerrar.</p>
          </div>
          <div className={styles.receiptField}>
            <label>
              N° Boleta
              <input
                type="text"
                value={receiptNumber}
                onChange={(event) => setReceiptNumber(event.target.value)}
                placeholder="Obligatorio"
              />
            </label>
          </div>
        </header>
        <div className={styles.cartList}>
          {cart.length === 0 ? (
            <p className={styles.empty}>No hay productos en el carrito.</p>
          ) : (
            cart.map((item) => (
              <div className={styles.cartItem} key={item.sku}>
                <div>
                  <h4>{item.name}</h4>
                  <span className={styles.sku}>SKU {item.sku}</span>
                </div>
                <div className={styles.quantityControls}>
                  <button onClick={() => updateCartQuantity(item.sku, item.quantity - 1)}>-</button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateCartQuantity(item.sku, Number(event.target.value))}
                  />
                  <button onClick={() => updateCartQuantity(item.sku, item.quantity + 1)}>+</button>
                </div>
                <div className={styles.price}>
                  <span>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                  <small>${item.price.toLocaleString('es-CL')} c/u</small>
                </div>
              </div>
            ))
          )}
        </div>
        <footer className={styles.summary}>
          <div>
            <p>Total a pagar</p>
            <h3>${total.toLocaleString('es-CL')}</h3>
          </div>
          <button className={styles.checkoutButton} onClick={handleSale}>
            Cerrar venta
          </button>
        </footer>
        {message && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
            {message.text}
          </div>
        )}
      </section>
    </div>
  );
}
