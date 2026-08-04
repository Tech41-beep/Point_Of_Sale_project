import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, logoutUser } from '../../Features/auth/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetchCurrentUser();
      setUser(response?.result || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
