import React, { useEffect, useState, createContext, useContext } from 'react';

const AuthContext = createContext(undefined);
const AUTH_STORAGE_KEY = 'uniflow_auth';

function createFakeJwt(payload) {
  const base64 = btoa(JSON.stringify(payload));
  return `fake.${base64}.token`;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.token && parsed?.user) {
        setIsAuthenticated(true);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const saveSession = (nextUser) => {
    const payload = {
      sub: nextUser.email,
      name: nextUser.name,
      role: nextUser.role
    };
    const nextToken = createFakeJwt(payload);
    setIsAuthenticated(true);
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: nextToken, user: nextUser })
    );
  };

  const register = ({ name, email, role }) => {
    const newUser = {
      name,
      email,
      role: role || 'student'
    };
    saveSession(newUser);
  };

  const login = ({ email, role }) => {
    const existing =
      user && user.email === email
        ? user
        : {
            name: 'UniFlow User',
            email,
            role: role || 'student'
          };
    saveSession(existing);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role: user?.role || null,
        token,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
