import api from './api';

export const teamService = {
  getTeams: async () => {
    const res = await api.get('/teams');
    return res.data.data;
  },

  getTeamById: async (id) => {
    const res = await api.get(`/teams/${id}`);
    return res.data.data;
  },

  createTeam: async (data) => {
    const res = await api.post('/teams', data);
    return res.data.data;
  },

  updateTeam: async (id, data) => {
    const res = await api.put(`/teams/${id}`, data);
    return res.data.data;
  },

  deleteTeam: async (id) => {
    const res = await api.delete(`/teams/${id}`);
    return res.data;
  }
};
