import api from './api';

export const playerService = {
  getPlayers: async (params = {}) => {
    const res = await api.get('/players', { params });
    return res.data;
  },

  getPlayerById: async (id) => {
    const res = await api.get(`/players/${id}`);
    return res.data.data;
  },

  createPlayer: async (data) => {
    const res = await api.post('/players', data);
    return res.data.data;
  },

  updatePlayer: async (id, data) => {
    const res = await api.put(`/players/${id}`, data);
    return res.data.data;
  },

  deletePlayer: async (id) => {
    const res = await api.delete(`/players/${id}`);
    return res.data;
  }
};
