import { Fragment } from 'react';
import { useData } from '../context/DataContext.jsx';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { orders, getTodaySalesTotal, getLowStockProducts } = useData();

  const pendingOrders = orders.filter((order) => order.status === 'pendiente');

  return (
    <div className={styles.dashboard}>
      <section className={styles.kpis}>
        <KpiCard title="Ventas del día" value={`$${getTodaySalesTotal().toLocaleString('es-CL')}`} accent="rose" />
        <KpiCard title="Pedidos pendientes" value={pendingOrders.length} accent="mint" />
        <KpiCard
          title="Stock crítico"
          value={getLowStockProducts().length}
          description="Productos con menos de 5 unidades"
          accent="rose"
        />
      </section>
      <section className={styles.panels}>
        <article className={styles.panel}>
          <header>
            <h3>Próximos pedidos personalizados</h3>
            <span className={styles.tag}>Agenda</span>
          </header>
          <div className={styles.list}>
            {pendingOrders.length === 0 ? (
              <p className={styles.empty}>No hay pedidos pendientes, ¡buen trabajo!</p>
            ) : (
              pendingOrders.map((order) => (
                <Fragment key={order.id}>
                  <div className={styles.orderItem}>
                    <div>
                      <h4>{order.clientName}</h4>
                      <p>{order.description}</p>
                    </div>
                    <div className={styles.orderMeta}>
                      <span>{new Date(order.deliveryDate).toLocaleDateString('es-CL')}</span>
                      <span>{new Date(order.deliveryDate).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </Fragment>
              ))
            )}
          </div>
        </article>
        <article className={styles.panel}>
          <header>
            <h3>Productos con stock bajo</h3>
            <span className={styles.tag}>Inventario</span>
          </header>
          <div className={styles.list}>
            {getLowStockProducts().map((product) => (
              <div className={styles.productItem} key={product.sku}>
                <div>
                  <h4>{product.name}</h4>
                  <p>SKU {product.sku}</p>
                </div>
                <span className={styles.badge}>{product.stock} u.</span>
              </div>
            ))}
            {getLowStockProducts().length === 0 && (
              <p className={styles.empty}>Todo el stock se encuentra saludable.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function KpiCard({ title, value, description, accent }) {
  return (
    <div className={`${styles.kpiCard} ${accent === 'rose' ? styles.rose : styles.mint}`}>
      <p className={styles.kpiTitle}>{title}</p>
      <p className={styles.kpiValue}>{value}</p>
      {description && <p className={styles.kpiDescription}>{description}</p>}
    </div>
  );
}
