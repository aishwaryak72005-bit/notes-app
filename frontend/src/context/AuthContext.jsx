import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getCurrentUser();
      const token = localStorage.getItem('technotes_access_token');
      if (token && storedUser) {
        setUser(storedUser);
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('technotes_user', JSON.stringify(profile));
        } catch (error) {
          console.warn('Session verification error:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    return data;
  };

  const registerStudent = async (userData) => {
    const data = await authService.registerStudent(userData);
    setUser(data.user);
    return data;
  };

  const registerTeacher = async (userData) => {
    const data = await authService.registerTeacher(userData);
    setUser(data.user);
    return data;
  };

  const updateUser = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    setUser(updated);
    return updated;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isStudent,
        isTeacher,
        isAdmin,
        login,
        logout,
        registerStudent,
        registerTeacher,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
