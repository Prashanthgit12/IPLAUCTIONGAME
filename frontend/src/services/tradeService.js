import api from './api';

export const tradeService = {
  getTrades: async (teamId = null) => {
    const url = teamId ? `/trades?teamId=${teamId}` : '/trades';
    const res = await api.get(url);
    return res.data?.data || [];
  },

  proposeTrade: async (payload) => {
    const res = await api.post('/trades', payload);
    return res.data;
  },

  respondTrade: async (tradeId, action) => {
    const res = await api.put(`/trades/${tradeId}/respond`, { action });
    return res.data;
  }
};

export default tradeService;
