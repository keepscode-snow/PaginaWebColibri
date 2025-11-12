import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin'] },
  { to: '/productos', label: 'Productos', icon: '🧁', roles: ['admin'] },
  { to: '/ventas', label: 'Ventas', icon: '🧾', roles: ['admin', 'cashier'] },
  { to: '/pedidos', label: 'Pedidos', icon: '🎂', roles: ['admin', 'cashier'] },
  { to: '/reportes', label: 'Reportes', icon: '📈', roles: ['admin'] }
];

export default function Sidebar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>🐦</span>
        <div>
          <h1>Colibrí</h1>
          <p>Pastelería</p>
        </div>
      </div>
      <nav className={styles.nav}>
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>
      <div className={styles.footer}>
        <p className={styles.roleTag}>{user?.role === 'admin' ? 'Administradora' : 'Cajera'}</p>
        <button className={styles.themeToggle} onClick={toggleTheme}>
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>
    </aside>
  );
}
