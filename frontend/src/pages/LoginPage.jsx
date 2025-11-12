import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { success, message } = await login(form.username, form.password);
    if (!success) {
      setError(message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div>
          <h1>Colibrí Pastelería</h1>
          <p>
            Sistema de gestión para ventas en mostrador, control de stock y pedidos personalizados.
          </p>
          <ul>
            <li>Interfaz optimizada para pantallas táctiles.</li>
            <li>Roles diferenciados para administrador y cajero.</li>
            <li>Reportes visuales para decisiones rápidas.</li>
          </ul>
        </div>
      </div>
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Inicia sesión</h2>
          <p className={styles.subtitle}>Accede al panel del punto de venta.</p>
          <label>
            Usuario
            <input
              type="text"
              required
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Ej: admin o cajero"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="•••••••"
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit">Entrar</button>
          <p className={styles.helper}>Admin: admin/admin123 · Cajero: cajero/cajero123</p>
        </form>
      </div>
    </div>
  );
}
