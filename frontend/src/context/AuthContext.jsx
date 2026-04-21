import React, { useEffect, useState, createContext, useContext } from 'react';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

const AuthContext = createContext(undefined);
const AUTH_STORAGE_KEY = 'uniflow_auth';

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        if (!parsed?.token || !parsed?.user) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        setToken(parsed.token);
        setUser(parsed.user);
        setIsAuthenticated(true);

        const profileResponse = await authService.getMe();
        const latestUser = profileResponse.data.user;
        setUser(latestUser);
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ token: parsed.token, user: latestUser })
        );
      } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const saveSession = (sessionToken, sessionUser) => {
    setIsAuthenticated(true);
    setUser(sessionUser);
    setToken(sessionToken);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: sessionToken, user: sessionUser })
    );
  };

  const register = async ({ name, email, password, role }) => {
    const response = await authService.signup({ name, email, password, role });
    const { token: nextToken, user: nextUser } = response.data;
    saveSession(nextToken, nextUser);
    return nextUser;
  };

  const login = async ({ email, password }) => {
    const response = await authService.login({ email, password });
    const { token: nextToken, user: nextUser } = response.data;
    saveSession(nextToken, nextUser);
    return nextUser;
  };

  const refreshProfile = async () => {
    const response = await userService.getMyProfile();
    const nextUser = response.data;
    setUser(nextUser);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token, user: nextUser })
    );
    return nextUser;
  };

  const updateProfile = async (payload) => {
    const response = await userService.updateMyProfile(payload);
    const nextUser = response.data;
    setUser(nextUser);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token, user: nextUser })
    );
    return nextUser;
  };

  const updatePassword = async (payload) => {
    const response = await authService.changePassword(payload);
    return response.data;
  };

  const listUsers = async () => {
    const response = await userService.getAllUsers();
    return response.data;
  };

  const editUser = async (id, payload) => {
    const response = await userService.updateUser(id, payload);
    return response.data;
  };

  const removeUser = async (id) => {
    const response = await userService.deleteUser(id);
    return response.data;
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
        isLoading,
        isAuthenticated,
        user,
        role: user?.role || null,
        token,
        register,
        login,
        logout,
        refreshProfile,
        updateProfile,
        updatePassword,
        listUsers,
        editUser,
        removeUser
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
