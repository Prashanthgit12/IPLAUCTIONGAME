import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { auctionService } from '../services/auctionService';
import { setAuthToken } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('auctionx_token');
      if (token) {
        setAuthToken(token);
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (err) {
          console.error('[Auth] Session token invalid:', err.message);
          setAuthToken(null);
          sessionStorage.removeItem('auctionx_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return data;
    } catch (err) {
      addToast(err.message, 'danger');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      addToast(`Account registered successfully as ${data.user.role}!`, 'success');
      return data;
    } catch (err) {
      addToast(err.message, 'danger');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auctionService.pauseOnSignout();
    } catch (e) {
      // ignore
    }
    authService.logout();
    setUser(null);
    addToast('Logged out successfully. Auction safely paused.', 'info');
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (err) {
      console.error('[Auth] Refresh user error:', err.message);
    }
  };

  const assignFranchise = async (teamId) => {
    try {
      const updatedUser = await authService.assignTeam(teamId);
      setUser(updatedUser);
      addToast(`Franchise assigned successfully!`, 'success');
      return updatedUser;
    } catch (err) {
      addToast(err.message || 'Failed to assign franchise', 'danger');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        assignFranchise,
        logout,
        refreshUser,
        isAdmin: user?.role === 'ADMIN',
        isTeamOwner: user?.role === 'TEAM_OWNER',
        isViewer: user?.role === 'VIEWER'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
