// Cliente de API que faz requisições reais para o backend

// URL base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Cabeçalhos padrão
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Adicionar token de autenticação se existir
  const auth = localStorage.getItem('auth_token');
  if (auth) {
    headers['Authorization'] = `Bearer ${auth}`;
    console.log('Token encontrado e adicionado ao cabeçalho:', auth);
  } else {
    console.log('Nenhum token de autenticação encontrado no localStorage');
  }

  return headers;
};

// Cliente genérico para entidades
export const createEntityClient = (entityPath) => {
  const client = {
    // Listar todos os itens com paginação e filtros
    list: async (params = {}) => {
      try {
        const queryParams = new URLSearchParams();
        
        // Adicionar parâmetros de paginação
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        // Adicionar outros filtros
        Object.entries(params).forEach(([key, value]) => {
          if (key !== 'page' && key !== 'limit' && value !== undefined) {
            queryParams.append(key, value);
          }
        });
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const url = `${API_BASE_URL}/api/${entityPath}${queryString}`;
        console.log(`Fazendo requisição GET para: ${url}`);
        
        const headers = getHeaders();
        console.log('Usando cabeçalhos:', headers);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });
        
        if (!response.ok) {
          console.error(`Erro na resposta: Status ${response.status} - ${response.statusText}`);
          throw new Error(`Error fetching ${entityPath}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extrair a lista de itens da resposta, se estiver dentro de uma propriedade
        // Por exemplo, se a API retornar { customers: [...], pagination: {...} }
        const singularEntityName = entityPath.endsWith('s') ? 
                                  entityPath.slice(0, -1) : 
                                  entityPath;
        
        const pluralEntityName = `${singularEntityName}s`;
        
        // Se a resposta for um array, retorne-a diretamente
        if (Array.isArray(data)) {
          return data;
        }
        
        // Se a resposta contém os itens em uma propriedade com o nome plural da entidade
        if (data[pluralEntityName]) {
          return params.includePagination ? data : data[pluralEntityName];
        }
        
        // Se a resposta contém os itens em uma propriedade 'data'
        if (data.data) {
          return params.includePagination ? data : data.data;
        }
        
        // Se não for nenhum dos casos acima, retorna o objeto completo
        return data;
      } catch (error) {
        console.error(`Error in list ${entityPath}:`, error);
        throw error;
      }
    },
    
    // Obter um item por ID
    get: async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/${entityPath}/${id}`, {
          method: 'GET',
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching ${entityPath} by ID: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error in get ${entityPath}:`, error);
        throw error;
      }
    },
    
    // Criar um novo item
    create: async (data) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/${entityPath}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Error creating ${entityPath}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error in create ${entityPath}:`, error);
        throw error;
      }
    },
    
    // Atualizar um item existente
    update: async (id, data) => {
      try {
        console.log(`Enviando requisição de atualização para ${entityPath}/${id}:`, data);
        
        const response = await fetch(`${API_BASE_URL}/api/${entityPath}/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        
        console.log(`Resposta da atualização ${entityPath}/${id}:`, response.status, response.statusText);
        
        if (!response.ok) {
          // Tentar obter detalhes do erro
          let errorDetails = '';
          try {
            const errorBody = await response.json();
            errorDetails = errorBody.message || response.statusText;
          } catch (e) {
            errorDetails = response.statusText;
          }
          
          throw new Error(`Error updating ${entityPath}: ${errorDetails}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error in update ${entityPath}:`, error);
        throw error;
      }
    },
    
    // Remover um item
    delete: async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/${entityPath}/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(`Error deleting ${entityPath}: ${response.statusText}`);
          error.response = {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          };
          throw error;
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error in delete ${entityPath}:`, error);
        throw error;
      }
    },
    
    // Filtrar dados (alias para list com parâmetros)
    filter: async (params = {}) => {
      return client.list(params);
    }
  };
  
  return client;
};

// Autenticação
export const authClient = {
  login: async (email, password) => {
    try {
      console.log(`Tentando fazer login com email: ${email}`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Resposta de login:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Login bem-sucedido, dados recebidos:', { 
        user: data.user,
        tokenRecebido: !!data.token
      });
      
      // Limpar qualquer autenticação anterior
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Armazenar token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      console.log('Token e usuário armazenados no localStorage');
      
      return data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },
  
  isAuthenticated: () => {
    const isAuth = !!localStorage.getItem('auth_token');
    console.log('Verificando autenticação:', isAuth);
    return isAuth;
  },
  
  logout: () => {
    console.log('Fazendo logout e removendo dados de autenticação');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return true;
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
}; 