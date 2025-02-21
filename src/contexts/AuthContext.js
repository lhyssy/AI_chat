import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从本地存储加载用户信息
    const storedUser = storage.get(STORAGE_KEYS.USER);
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    setUser(userData);
    storage.set(STORAGE_KEYS.USER, userData);
  };

  const logout = () => {
    setUser(null);
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.TOKEN);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 