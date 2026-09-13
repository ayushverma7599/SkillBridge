
import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// ✅ Platform-specific storage helper
export const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  },
  
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  async deleteItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// Add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token fetch error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItem('token');
      await storage.deleteItem('user');
    }
    return Promise.reject(error);
  }
);

// Export authAPI
export const authAPI = {
  login: async ({ email, password }) => {
    return apiClient.post('/auth/login', { email, password });
  },
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },
};

// Campus projects/tasks board
export const projectAPI = {
  getAllProjects: async (params = {}) => {
    return apiClient.get('/projects', { params });
  },
  getProjectById: async (id) => {
    return apiClient.get(`/projects/${id}`);
  },
  createProject: async (data) => {
    return apiClient.post('/projects', data);
  },
  applyToProject: async (projectId, coverLetter) => {
    return apiClient.post('/projects/apply', { projectId, coverLetter });
  },
  getMyProjects: async () => {
    return apiClient.get('/projects/my-projects');
  },
  getMyApplications: async () => {
    return apiClient.get('/projects/my-applications');
  },
};

// Academic Schedule & Workload Manager
export const scheduleAPI = {
  getSchedule: async () => {
    return apiClient.get('/schedule');
  },
  addItem: async (item) => {
    return apiClient.post('/schedule', item);
  },
  deleteItem: async (id) => {
    return apiClient.delete(`/schedule/${id}`);
  },
  getWorkload: async () => {
    return apiClient.get('/schedule/workload');
  },
};

// Campus verification — list of recognised colleges (used at registration)
export const collegeAPI = {
  list: async () => {
    return apiClient.get('/colleges');
  },
};

// AI Learning Gap Detector — diagnostic quizzes, weakness analysis, adaptive study plans
export const learningAPI = {
  getSubjects: async () => {
    return apiClient.get('/learning/subjects');
  },
  getQuiz: async (subject) => {
    return apiClient.get('/learning/quiz', { params: { subject } });
  },
  submitAttempt: async (subject, answers) => {
    return apiClient.post('/learning/attempts', { subject, answers });
  },
  getStudyPlan: async (subject) => {
    return apiClient.get('/learning/study-plan', { params: { subject } });
  },
  getAttemptHistory: async (subject) => {
    return apiClient.get('/learning/attempts', { params: subject ? { subject } : {} });
  },
};

export default apiClient;
