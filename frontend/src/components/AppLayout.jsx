import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.contentArea}>
        <TopBar user={user} currentPath={location.pathname} />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
