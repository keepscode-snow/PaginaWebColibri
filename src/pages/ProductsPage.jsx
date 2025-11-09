import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './ProductsPage.module.css';

const categories = ['Todos', 'Pasteles', 'Tortas', 'Galletas', 'Chocolates', 'Postres'];

export default function ProductsPage() {
  const { products, updateProductPrice } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editing, setEditing] = useState(null);
  const [priceValue, setPriceValue] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'Todos' || product.category === category;
      const matchesStock = !lowStockOnly || product.stock <= 5;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, category, lowStockOnly]);

  const startEditing = (product) => {
    setEditing(product.sku);
    setPriceValue(product.price.toString());
  };

  const savePrice = (sku) => {
    const next = parseFloat(priceValue);
    if (!Number.isNaN(next)) {
      updateProductPrice(sku, Number(next.toFixed(2)));
    }
    setEditing(null);
  };

  const suggestions = products
    .filter((product) =>
      search && product.name.toLowerCase().includes(search.toLowerCase())
        ? product
        : search && product.sku.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className={styles.products}>
      <section className={styles.filters}>
        <div>
          <label className={styles.searchLabel}>
            Buscar producto
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="SKU o nombre"
              list="product-suggestions"
            />
            <datalist id="product-suggestions">
              {suggestions.map((product) => (
                <option key={product.sku} value={product.name} />
              ))}
            </datalist>
          </label>
        </div>
        <div className={styles.filterGroup}>
          <label>
            Categoría
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) => setLowStockOnly(event.target.checked)}
            />
            Solo stock bajo
          </label>
        </div>
      </section>
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              {user?.role === 'admin' && <th className={styles.actionsHeader}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.sku}>
                <td>{product.sku}</td>
                <td>
                  <div className={styles.productName}>{product.name}</div>
                </td>
                <td>
                  <span className={styles.category}>{product.category}</span>
                </td>
                <td>
                  {editing === product.sku ? (
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={priceValue}
                      onChange={(event) => setPriceValue(event.target.value)}
                      className={styles.priceInput}
                    />
                  ) : (
                    `$${product.price.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`
                  )}
                </td>
                <td>
                  <span className={`${styles.stockBadge} ${product.stock <= 5 ? styles.low : ''}`}>
                    {product.stock}
                  </span>
                </td>
                {user?.role === 'admin' && (
                  <td className={styles.actions}>
                    {editing === product.sku ? (
                      <>
                        <button className={styles.saveButton} onClick={() => savePrice(product.sku)}>
                          Guardar
                        </button>
                        <button className={styles.cancelButton} onClick={() => setEditing(null)}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button className={styles.editButton} onClick={() => startEditing(product)}>
                        Editar precio
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <p className={styles.empty}>No se encontraron productos con los filtros aplicados.</p>
        )}
      </section>
    </div>
  );
}
