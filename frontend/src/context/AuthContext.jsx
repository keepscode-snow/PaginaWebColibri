import React, { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, setTokens, getTokens } from '../api/client.js';

const AuthContext = createContext();

// Tokens persistidos si existen
const initialUser = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const tokens = await apiFetch('/api/auth/token/', {
        method: 'POST',
        body: { username, password },
      });
      setTokens(tokens);
      const me = await apiFetch('/api/me/');
      const role = me.is_staff || me.rol === 'admin' ? 'admin' : 'cashier';
      setUser({ username: me.username, role, name: me.username });
      navigate(role === 'admin' ? '/dashboard' : '/ventas', { replace: true });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Error de autenticación' };
    }
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
