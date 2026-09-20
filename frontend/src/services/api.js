import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dynamic token getter without relying on localStorage
let inMemoryToken = sessionStorage.getItem('auctionx_token') || null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  if (token) {
    sessionStorage.setItem('auctionx_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem('auctionx_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize with current session token if present
if (inMemoryToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${inMemoryToken}`;
}

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid/obsolete token
      inMemoryToken = null;
      sessionStorage.removeItem('auctionx_token');
      delete api.defaults.headers.common['Authorization'];
    }

    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
