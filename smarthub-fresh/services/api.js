import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Apne backend ka IP ya localhost (for web) set karo yahaan
const API_URL = 'http://192.168.1.18:5000/api/v1'; // Replace 192.168.1.X with your machine IP

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token').catch(() => null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export default api;
