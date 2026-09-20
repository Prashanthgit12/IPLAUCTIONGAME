import api from './api';

export const roomService = {
  createRoom: async (payload) => {
    const res = await api.post('/rooms', payload);
    return res.data;
  },

  getRoom: async (roomCode) => {
    const res = await api.get(`/rooms/${roomCode}`);
    return res.data?.data;
  },

  joinRoom: async (roomCode, payload) => {
    const res = await api.post(`/rooms/${roomCode}/join`, payload);
    return res.data;
  },

  claimTeam: async (roomCode, payload) => {
    const res = await api.post(`/rooms/${roomCode}/claim-team`, payload);
    return res.data;
  },

  getPublicRooms: async () => {
    const res = await api.get('/rooms');
    return res.data?.data || [];
  },

  startAuction: async (roomCode) => {
    const res = await api.post(`/rooms/${roomCode}/start`);
    return res.data;
  }
};

export default roomService;
