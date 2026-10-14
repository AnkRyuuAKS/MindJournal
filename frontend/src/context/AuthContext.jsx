import React, { createContext, useContext, useEffect, useState } from 'react';
import { register, login, logout, fetchMe, getToken, clearToken } from '../api/authClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      // Only attempt fetchMe if we have a stored token
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchMe();
        setUser(data.user);
      } catch {
        // Token invalid/expired – clear it
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleRegister = async (name, email, password) => {
    const data = await register(name, email, password);
    setUser(data.user);
  };

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    setUser(data.user);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Even if the server call fails, clear local state
      clearToken();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};