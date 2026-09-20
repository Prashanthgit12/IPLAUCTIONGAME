import api from './api';

export const auctionService = {
  getActiveAuction: async () => {
    const res = await api.get('/auctions/active');
    return res.data.data;
  },

  placeBid: async (auctionId, data) => {
    const res = await api.post(`/auctions/${auctionId}/bid`, data);
    return res.data.data;
  },

  startAuction: async (auctionId) => {
    const res = await api.post(`/auctions/${auctionId}/start`);
    return res.data.data;
  },

  pauseAuction: async (auctionId) => {
    const res = await api.post(`/auctions/${auctionId}/pause`);
    return res.data.data;
  },

  pauseOnSignout: async () => {
    try {
      const res = await api.post('/auctions/pause-on-signout');
      return res.data;
    } catch (err) {
      return null;
    }
  },

  resumeAuction: async (auctionId) => {
    const res = await api.post(`/auctions/${auctionId}/resume`);
    return res.data.data;
  },

  endAuction: async (auctionId) => {
    const res = await api.post(`/auctions/${auctionId}/end`);
    return res.data.data;
  },

  markSold: async (auctionId) => {
    const res = await api.post(`/auctions/${auctionId}/sold`);
    return res.data.data;
  },

  markUnsold: async (auctionId) => {
    const res = await api.post(`/auctions/${auctionId}/unsold`);
    return res.data.data;
  },

  nextPlayer: async (auctionId, playerId = null) => {
    const res = await api.post(`/auctions/${auctionId}/next-player`, { playerId });
    return res.data.data;
  },

  getResults: async (params = {}) => {
    const res = await api.get('/results', { params });
    return res.data.data;
  },

  getLeaderboard: async () => {
    const res = await api.get('/results/leaderboard');
    return res.data.data;
  },

  getAdminStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  resetAuctionToStart: async () => {
    const res = await api.post('/admin/reset-auction');
    return res.data;
  }
};
