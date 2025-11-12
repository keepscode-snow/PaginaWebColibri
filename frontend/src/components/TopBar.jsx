import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './TopBar.module.css';

const pathTitles = {
  '/dashboard': 'Panel General',
  '/productos': 'Catálogo de Productos',
  '/ventas': 'Caja de Ventas',
  '/pedidos': 'Pedidos Personalizados',
  '/reportes': 'Reportes y KPIs'
};

export default function TopBar({ currentPath }) {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  return (
    <header className={styles.topbar}>
      <div>
        <p className={styles.subtitle}>Bienvenida, {user?.name}</p>
        <h2 className={styles.title}>{pathTitles[currentPath] || 'Colibrí'}</h2>
      </div>
      <div className={styles.actions}>
        <button className={styles.quickAction} onClick={() => setExpanded((prev) => !prev)}>
          ☰ Opciones
        </button>
        {expanded && (
          <div className={styles.dropdown}>
            <button onClick={logout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}
