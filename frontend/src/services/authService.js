import api, { setAuthToken } from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success && res.data.data.token) {
      setAuthToken(res.data.data.token);
    }
    return res.data.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.data.token) {
      setAuthToken(res.data.data.token);
    }
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  assignTeam: async (teamId) => {
    const res = await api.put('/auth/team', { teamId });
    return res.data.data;
  },

  logout: () => {
    setAuthToken(null);
  }
};
