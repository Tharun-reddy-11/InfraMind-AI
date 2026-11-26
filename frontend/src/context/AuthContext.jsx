import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('inframind_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => sessionStorage.getItem('inframind_token') || null);
  const [loading, setLoading] = useState(false);

  const login = (data) => {
    sessionStorage.setItem('inframind_token', data.accessToken);
    sessionStorage.setItem('inframind_user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    sessionStorage.removeItem('inframind_token');
    sessionStorage.removeItem('inframind_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    sessionStorage.setItem('inframind_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
