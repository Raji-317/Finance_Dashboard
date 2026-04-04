import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('finance_role') || 'Admin';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('finance_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('finance_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('finance_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleRole = (newRole) => setRole(newRole);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const isAdmin = role === 'Admin';

  return (
    <AuthContext.Provider value={{ role, toggleRole, darkMode, toggleDarkMode, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
