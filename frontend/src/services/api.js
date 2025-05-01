import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // URL base do seu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('Token não encontrado no localStorage');
    return Promise.reject('Token não encontrado');
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Erro de autenticação:', error);
      // Aqui você pode adicionar lógica para redirecionar para a página de login
    }
    return Promise.reject(error);
  }
);

// Função para criar um cliente de API para uma entidade específica
export const createEntityClient = (entityPath) => {
  return {
    get: (path = '') => {
      const url = `/api/${entityPath}${path}`;
      console.log('GET URL:', url);
      return api.get(url);
    },
    post: (data, path = '') => {
      const url = `/api/${entityPath}${path}`;
      console.log('POST URL:', url);
      return api.post(url, data);
    },
    put: (path, data) => {
      const url = `/api/${entityPath}${path}`;
      console.log('PUT URL:', url);
      return api.put(url, data);
    },
    delete: (path) => {
      const url = `/api/${entityPath}${path}`;
      console.log('DELETE URL:', url);
      return api.delete(url);
    }
  };
};

export default api; 