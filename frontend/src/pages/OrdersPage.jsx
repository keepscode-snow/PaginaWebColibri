import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import styles from './OrdersPage.module.css';

export default function OrdersPage() {
  const { orders, createOrder, updateOrderStatus } = useData();
  const [filters, setFilters] = useState({ search: '', status: 'todos', date: '' });
  const [form, setForm] = useState({
    clientName: '',
    phone: '',
    deliveryDate: '',
    description: '',
    deposit: '',
    status: 'pendiente'
  });
  const [feedback, setFeedback] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'todos' || order.status === filters.status;
      const matchesDate = !filters.date || order.deliveryDate.startsWith(filters.date);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, filters]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.clientName || !form.deliveryDate) {
      setFeedback({ type: 'error', text: 'Nombre y fecha de entrega son obligatorios.' });
      return;
    }
    createOrder({
      ...form,
      deposit: Number(form.deposit || 0)
    });
    setForm({ clientName: '', phone: '', deliveryDate: '', description: '', deposit: '', status: 'pendiente' });
    setFeedback({ type: 'success', text: 'Pedido registrado correctamente.' });
  };

  return (
    <div className={styles.orders}>
      <section className={styles.formSection}>
        <h3>Registrar pedido personalizado</h3>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label>
              Nombre del cliente
              <input
                type="text"
                value={form.clientName}
                onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))}
                required
              />
            </label>
            <label>
              Teléfono
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="+56 9 1234 5678"
              />
            </label>
            <label>
              Fecha y hora de entrega
              <input
                type="datetime-local"
                value={form.deliveryDate}
                onChange={(event) => setForm((prev) => ({ ...prev, deliveryDate: event.target.value }))}
                required
              />
            </label>
            <label>
              Anticipo
              <input
                type="number"
                min="0"
                value={form.deposit}
                onChange={(event) => setForm((prev) => ({ ...prev, deposit: event.target.value }))}
                placeholder="$0"
              />
            </label>
            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="pendiente">Pendiente</option>
                <option value="entregado">Entregado</option>
              </select>
            </label>
          </div>
          <label>
            Descripción del pedido
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows="3"
              placeholder="Diseño, sabores y observaciones"
            />
          </label>
          <button type="submit">Guardar pedido</button>
        </form>
        {feedback && (
          <p className={`${styles.feedback} ${feedback.type === 'success' ? styles.success : styles.error}`}>
            {feedback.text}
          </p>
        )}
      </section>
      <section className={styles.listSection}>
        <header>
          <div>
            <h3>Listado de pedidos</h3>
            <p>Filtra por estado, fecha o palabras clave.</p>
          </div>
          <div className={styles.filters}>
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Buscar por cliente o descripción"
            />
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="entregado">Entregados</option>
            </select>
            <input
              type="date"
              value={filters.date}
              onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
        </header>
        <div className={styles.orderList}>
          {filteredOrders.length === 0 ? (
            <p className={styles.empty}>No hay pedidos con los criterios seleccionados.</p>
          ) : (
            filteredOrders.map((order) => (
              <article key={order.id} className={styles.orderCard}>
                <header>
                  <div>
                    <h4>{order.clientName}</h4>
                    <span>{order.phone}</span>
                  </div>
                  <span className={`${styles.status} ${order.status === 'pendiente' ? styles.pending : styles.delivered}`}>
                    {order.status}
                  </span>
                </header>
                <p>{order.description || 'Sin comentarios'}</p>
                <footer>
                  <div>
                    <strong>Entrega</strong>
                    <span>
                      {new Date(order.deliveryDate).toLocaleDateString('es-CL', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}{' '}
                      ·{' '}
                      {new Date(order.deliveryDate).toLocaleTimeString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <strong>Anticipo</strong>
                    <span>${order.deposit.toLocaleString('es-CL')}</span>
                  </div>
                  <div>
                    <strong>Acción</strong>
                    <select
                      value={order.status}
                      onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
                </footer>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
