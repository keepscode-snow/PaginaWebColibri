import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/ventas" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ProductsPage />
            </PrivateRoute>
          }
        />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route
          path="/reportes"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <ReportsPage />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
