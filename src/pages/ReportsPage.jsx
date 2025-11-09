import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useData } from '../context/DataContext.jsx';
import styles from './ReportsPage.module.css';

const formatCurrency = (value) => `$${value.toLocaleString('es-CL')}`;

const exportToCsv = (filename, rows) => {
  const processRow = (row) =>
    row
      .map((value) => {
        if (value === null || value === undefined) return '';
        const stringValue = value.toString();
        if (stringValue.search(/([",\n])/g) >= 0) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');

  const csvContent = rows.map(processRow).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ReportsPage() {
  const { sales, orders, getTopProducts } = useData();
  const [range, setRange] = useState({ start: '', end: '' });

  const topProducts = useMemo(
    () =>
      getTopProducts({
        startDate: range.start || undefined,
        endDate: range.end || undefined
      }),
    [getTopProducts, range]
  );

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const averageTicket = sales.length ? totalSales / sales.length : 0;
  const pendingOrders = orders.filter((order) => order.status === 'pendiente');

  const exportSales = () => {
    const rows = [
      ['N° Boleta', 'Fecha', 'Total'],
      ...sales.map((sale) => [
        sale.receiptNumber,
        new Date(sale.date).toLocaleString('es-CL'),
        sale.total
      ])
    ];
    exportToCsv('ventas-colibri.csv', rows);
  };

  const exportOrders = () => {
    const rows = [
      ['Pedido', 'Cliente', 'Entrega', 'Estado', 'Anticipo'],
      ...orders.map((order) => [
        order.id,
        order.clientName,
        new Date(order.deliveryDate).toLocaleString('es-CL'),
        order.status,
        order.deposit
      ])
    ];
    exportToCsv('pedidos-colibri.csv', rows);
  };

  return (
    <div className={styles.reports}>
      <section className={styles.kpis}>
        <ReportKpi title="Ventas totales" value={formatCurrency(totalSales)} detail={`${sales.length} ventas registradas`} />
        <ReportKpi title="Ticket promedio" value={formatCurrency(averageTicket || 0)} detail="Promedio por boleta" />
        <ReportKpi title="Pedidos pendientes" value={pendingOrders.length} detail="Listos para producir" />
      </section>
      <section className={styles.chartSection}>
        <header>
          <div>
            <h3>Top 10 productos más vendidos</h3>
            <p>Filtra el ranking por rango de fechas o deja vacío para ver el histórico.</p>
          </div>
          <div className={styles.dateFilters}>
            <label>
              Desde
              <input
                type="date"
                value={range.start}
                onChange={(event) => setRange((prev) => ({ ...prev, start: event.target.value }))}
              />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={range.end}
                onChange={(event) => setRange((prev) => ({ ...prev, end: event.target.value }))}
              />
            </label>
          </div>
        </header>
        <div className={styles.chartWrapper}>
          {topProducts.length === 0 ? (
            <p className={styles.empty}>No hay ventas registradas en el periodo seleccionado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topProducts}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} u.`, 'Unidades']} />
                <Bar dataKey="sold" radius={[12, 12, 0, 0]} fill="#f472b6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
      <section className={styles.tables}>
        <article>
          <header>
            <h4>Ventas registradas</h4>
            <button onClick={exportSales}>Exportar CSV</button>
          </header>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>N° Boleta</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="3" className={styles.emptyCell}>
                      Aún no se registran ventas.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.receiptNumber}</td>
                      <td>{new Date(sale.date).toLocaleString('es-CL')}</td>
                      <td>{formatCurrency(sale.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <header>
            <h4>Pedidos personalizados</h4>
            <button onClick={exportOrders}>Exportar CSV</button>
          </header>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Entrega</th>
                  <th>Estado</th>
                  <th>Anticipo</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.emptyCell}>
                      No hay pedidos.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.clientName}</td>
                      <td>{new Date(order.deliveryDate).toLocaleString('es-CL')}</td>
                      <td>
                        <span className={`${styles.statusTag} ${order.status === 'pendiente' ? styles.pending : styles.delivered}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatCurrency(order.deposit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

function ReportKpi({ title, value, detail }) {
  return (
    <div className={styles.kpiCard}>
      <p className={styles.kpiTitle}>{title}</p>
      <p className={styles.kpiValue}>{value}</p>
      <p className={styles.kpiDetail}>{detail}</p>
    </div>
  );
}
