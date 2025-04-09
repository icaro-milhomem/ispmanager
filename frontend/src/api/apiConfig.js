/**
 * Configurações da API
 * Este arquivo centraliza as configurações da API usada pelo aplicativo
 */

// Configuração para usar apenas a API real (sem fallbacks)
export const USE_REAL_API_ONLY = import.meta.env.VITE_USE_REAL_API_ONLY === 'true' || true;
export const DISABLE_FALLBACKS = import.meta.env.VITE_DISABLE_FALLBACKS === 'true' || true;

// URL base da API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Tempo máximo de espera para requisições (em ms)
export const API_TIMEOUT = 30000;

// Versão da API
export const API_VERSION = 'v1';

// Log de requisições habilitado
export const ENABLE_REQUEST_LOGGING = import.meta.env.NODE_ENV === 'development';

// Configuração de cabeçalhos padrão
export const getDefaultHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Manejador global de erros da API
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // A requisição foi feita e o servidor respondeu com um status diferente de 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    
    // Verificar se é erro de autenticação
    if (error.response.status === 401) {
      // Redirecionar para login se não autenticado
      console.warn('Sessão expirada ou inválida, redirecionando para login...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    
    return {
      error: true,
      status: error.response.status,
      message: error.response.data.message || 'Erro no servidor'
    };
  } else if (error.request) {
    // A requisição foi feita mas não recebeu resposta
    console.error('Request error:', error.request);
    return {
      error: true,
      status: 0,
      message: 'Sem resposta do servidor. Verifique sua conexão.'
    };
  } else {
    // Erro na configuração da requisição
    return {
      error: true,
      status: 0,
      message: error.message || 'Erro ao configurar requisição'
    };
  }
}; 