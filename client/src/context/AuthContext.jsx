import React, { createContext, useState, useEffect } from 'react';
import { api, tokenStorage, userStorage } from '../services/api';

export const AuthContext = createContext(null);
export { useAuth } from './useAuth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStorage.get());
  const [token, setToken] = useState(() => tokenStorage.get());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const savedToken = tokenStorage.get();
      if (savedToken) {
        try {
          const res = await api.auth.me();
          if (res && res.user) {
            setUser(res.user);
            userStorage.set(res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          tokenStorage.remove();
          userStorage.remove();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (nisn, password) => {
    const res = await api.auth.login({ nisn, password });
    tokenStorage.set(res.token);
    userStorage.set(res.user);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (nisn, nama, password) => {
    const res = await api.auth.register({ nisn, nama, password });
    tokenStorage.set(res.token);
    userStorage.set(res.user);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    tokenStorage.remove();
    userStorage.remove();
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (newUserData) => {
    const updated = { ...user, ...newUserData };
    setUser(updated);
    userStorage.set(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isSiswa: user?.role === 'siswa',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}



