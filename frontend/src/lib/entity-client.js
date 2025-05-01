import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Função para obter o token JWT do localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Configurar o axios para incluir o token em todas as requisições
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createEntityClient = (entityType) => {
  const baseURL = `${API_BASE_URL}/${entityType}`;
  
  return {
    getAll: async () => {
      const response = await axios.get(baseURL);
      return response.data;
    },

    getById: async (id) => {
      const response = await axios.get(`${baseURL}/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axios.post(baseURL, data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axios.put(`${baseURL}/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axios.delete(`${baseURL}/${id}`);
      return response.data;
    }
  };
}; 