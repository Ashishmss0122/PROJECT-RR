import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token and user exist in local storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('sf_token');
      const localUser = localStorage.getItem('sf_user');

      if (token && localUser) {
        try {
          setUser(JSON.parse(localUser));
          // Validate token with backend
          const res = await API.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('sf_user', JSON.stringify(res.data.user));
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user: loggedUser } = res.data;

      localStorage.setItem('sf_token', token);
      localStorage.setItem('sf_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please try again.';
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const res = await API.post('/auth/register', { fullName, email, password });
      const { token, user: registeredUser } = res.data;

      localStorage.setItem('sf_token', token);
      localStorage.setItem('sf_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const logout = () => {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setUser(null);
  };

  const updateProfile = async (fullName, bio, skills) => {
    try {
      const res = await API.put('/auth/profile', { fullName, bio, skills });
      const updatedUser = { ...user, fullName, bio, skills };
      localStorage.setItem('sf_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile.';
    }
  };

  const updateAvatarState = (profileImagePath) => {
    const updatedUser = { ...user, profileImage: profileImagePath };
    localStorage.setItem('sf_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateAvatarState,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
