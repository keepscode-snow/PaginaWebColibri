import React, { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const defaultUsers = {
  admin: { password: 'admin123', role: 'admin', name: 'Administradora' },
  cajero: { password: 'cajero123', role: 'cashier', name: 'Cajera' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (username, password) => {
    const foundUser = defaultUsers[username?.toLowerCase()];
    if (foundUser && foundUser.password === password) {
      setUser({ username, role: foundUser.role, name: foundUser.name });
      navigate(foundUser.role === 'admin' ? '/dashboard' : '/ventas', { replace: true });
      return { success: true };
    }
    return { success: false, message: 'Credenciales incorrectas' };
  };

  const logout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
