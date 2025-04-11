// Cliente de API que faz requisições reais para o backend
import { 
  API_BASE_URL, 
  getDefaultHeaders, 
  handleApiError,
  ENABLE_REQUEST_LOGGING
} from './apiConfig';

// Cabeçalhos padrão
const getHeaders = () => {
  const headers = getDefaultHeaders();
  
  if (ENABLE_REQUEST_LOGGING) {
    console.log('Usando cabeçalhos:', headers);
  }
  
  return headers;
};

// Cliente genérico para entidades
export const createEntityClient = (entityPath) => {
  const client = {
    // Listar todos os itens com paginação e filtros
    list: async (params = {}) => {
      try {
        console.log(`[API Client] Iniciando requisição LIST para ${entityPath}`);
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
        
        console.log(`[API Client] Fazendo requisição GET para: ${url}`);
        
        const headers = getHeaders();
        
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });
        
        console.log(`[API Client] Resposta recebida para ${entityPath}, status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`[API Client] Erro na resposta: Status ${response.status} - ${response.statusText}`);
          throw new Error(`Error fetching ${entityPath}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        console.log(`[API Client] Content-Type da resposta: ${contentType}`);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`[API Client] Resposta não é do tipo JSON: ${contentType}`);
          return [];
        }
        
        const data = await response.json();
        console.log(`[API Client] Dados recebidos para ${entityPath}:`, data);
        
        // Extrair a lista de itens da resposta, se estiver dentro de uma propriedade
        // Por exemplo, se a API retornar { customers: [...], pagination: {...} }
        const singularEntityName = entityPath.endsWith('s') ? 
                                  entityPath.slice(0, -1) : 
                                  entityPath;
        
        const pluralEntityName = `${singularEntityName}s`;
        console.log(`[API Client] Nomes das entidades: singular=${singularEntityName}, plural=${pluralEntityName}`);
        
        // Se a resposta for um array, retorne-a diretamente
        if (Array.isArray(data)) {
          console.log(`[API Client] Resposta é um array, retornando diretamente. Tamanho: ${data.length}`);
          return data;
        }
        
        // Se a resposta contém os itens em uma propriedade com o nome plural da entidade
        if (data[pluralEntityName]) {
          console.log(`[API Client] Encontrada propriedade '${pluralEntityName}' na resposta. Tamanho: ${data[pluralEntityName].length}`);
          return params.includePagination ? data : data[pluralEntityName];
        }
        
        // Se a resposta contém os itens em uma propriedade 'data'
        if (data.data) {
          console.log(`[API Client] Encontrada propriedade 'data' na resposta. Tamanho: ${Array.isArray(data.data) ? data.data.length : 'não é array'}`);
          return params.includePagination ? data : data.data;
        }
        
        // Verificar se a propriedade existe com o primeiro caractere em maiúsculo
        const capitalizedPluralName = pluralEntityName.charAt(0).toUpperCase() + pluralEntityName.slice(1);
        if (data[capitalizedPluralName]) {
          console.log(`[API Client] Encontrada propriedade '${capitalizedPluralName}' na resposta. Tamanho: ${data[capitalizedPluralName].length}`);
          return params.includePagination ? data : data[capitalizedPluralName];
        }
        
        // Tentar encontrar qualquer propriedade que possa ser um array na resposta
        const arrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
        if (arrayProps.length > 0) {
          console.log(`[API Client] Encontrada propriedade array '${arrayProps[0]}' na resposta. Tamanho: ${data[arrayProps[0]].length}`);
          return params.includePagination ? data : data[arrayProps[0]];
        }
        
        // Se não for nenhum dos casos acima, retorna o objeto completo
        console.log(`[API Client] Nenhuma estrutura reconhecida, retornando objeto completo`);
        return data;
      } catch (error) {
        console.error(`[API Client] Erro em list ${entityPath}:`, error);
        
        // Adicionar tratativa específica para erros de conexão
        if (error.message && (
            error.message.includes('Failed to fetch') || 
            error.message.includes('Network Error') ||
            error.message.includes('NetworkError')
        )) {
          console.error(`[API Client] Erro de conexão detectado para ${entityPath}`);
          throw new Error(`Erro de conexão com o servidor. Verifique se o backend está em execução.`);
        }
        
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
        if (ENABLE_REQUEST_LOGGING) {
          console.log(`Enviando requisição de criação para ${entityPath}:`, data);
        }
        
        const response = await fetch(`${API_BASE_URL}/api/${entityPath}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        
        if (ENABLE_REQUEST_LOGGING) {
          console.log(`Resposta da criação ${entityPath}:`, response.status, response.statusText);
        }
        
        if (!response.ok) {
          // Tentar obter detalhes do erro
          let errorDetails = '';
          let errorData = {};
          try {
            errorData = await response.json();
            errorDetails = errorData.message || errorData.error || response.statusText;
          } catch (e) {
            console.error("Erro ao processar resposta de erro:", e);
            errorDetails = response.statusText;
          }
          
          console.error(`Erro na criação de ${entityPath}:`, {
            status: response.status,
            statusText: response.statusText,
            errorDetails,
            errorData
          });
          
          const error = new Error(`Error creating ${entityPath}: ${errorDetails}`);
          error.response = {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          };
          
          throw error;
        }
        
        // Capturar resposta com tratamento de erro
        try {
          const responseData = await response.json();
          
          if (ENABLE_REQUEST_LOGGING) {
            console.log(`Dados da resposta de criação ${entityPath}:`, responseData);
          }
          
          return responseData;
        } catch (parseError) {
          console.warn(`Erro ao analisar resposta JSON para criação de ${entityPath}:`, parseError);
          
          // Se não conseguir parsear a resposta, retorna um objeto genérico de sucesso
          return { 
            success: true, 
            message: "Criado com sucesso (resposta não JSON)"
          };
        }
      } catch (error) {
        console.error(`Error in create ${entityPath}:`, error);
        throw error;
      }
    },
    
    // Atualizar um item existente
    update: async (id, data) => {
      try {
        if (ENABLE_REQUEST_LOGGING) {
          console.log(`Enviando requisição de atualização para ${entityPath}/${id}:`, data);
        }
        
        if (!id) {
          console.error(`Tentativa de atualização com ID inválido: '${id}' para a entidade ${entityPath}`);
          throw new Error(`Cannot update ${entityPath} with invalid ID: ${id}`);
        }
        
        const response = await fetch(`${API_BASE_URL}/api/${entityPath}/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        
        if (ENABLE_REQUEST_LOGGING) {
          console.log(`Resposta da atualização ${entityPath}/${id}:`, response.status, response.statusText);
        }
        
        if (!response.ok) {
          // Tentar obter detalhes do erro
          let errorDetails = '';
          let errorData = {};
          try {
            errorData = await response.json();
            errorDetails = errorData.message || errorData.error || response.statusText;
          } catch (e) {
            console.error("Erro ao processar resposta de erro:", e);
            errorDetails = response.statusText;
          }
          
          console.error(`Erro na atualização de ${entityPath}/${id}:`, {
            status: response.status,
            statusText: response.statusText,
            errorDetails,
            errorData
          });
          
          const error = new Error(`Error updating ${entityPath}: ${errorDetails}`);
          error.response = {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          };
          
          throw error;
        }
        
        // Capturar resposta com tratamento de erro
        try {
          const responseData = await response.json();
          
          if (ENABLE_REQUEST_LOGGING) {
            console.log(`Dados da resposta de atualização ${entityPath}/${id}:`, responseData);
          }
          
          return responseData;
        } catch (parseError) {
          console.warn(`Erro ao analisar resposta JSON para ${entityPath}/${id}:`, parseError);
          
          // Se não conseguir parsear a resposta, retorna um objeto genérico de sucesso
          return { 
            success: true, 
            id: id,
            message: "Atualizado com sucesso (resposta não JSON)"
          };
        }
      } catch (error) {
        console.error(`Error in update ${entityPath}:`, error);
        throw error;
      }
    },
    
    // Remover um item
    delete: async (id) => {
      try {
        if (!id) {
          console.error(`Tentativa de exclusão com ID inválido: '${id}' para a entidade ${entityPath}`);
          throw new Error(`Cannot delete ${entityPath} with invalid ID: ${id}`);
        }
        
        console.log(`Enviando requisição DELETE para ${entityPath}/${id}`);
        const response = await fetch(`${API_BASE_URL}/api/${entityPath}/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        
        console.log(`Resposta da exclusão ${entityPath}/${id}:`, response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Erro ao excluir ${entityPath}/${id}:`, errorData);
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
      console.log(`[Auth] Tentando fazer login com email: ${email}`);
      
      const loginUrl = `${API_BASE_URL}/api/auth/login`;
      console.log(`[Auth] URL de login: ${loginUrl}`);
      
      const loginData = { email, password };
      console.log(`[Auth] Dados de login: ${JSON.stringify(loginData)}`);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      console.log('[Auth] Resposta de login:', {
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries([...response.headers])
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Auth] Erro na resposta: ${errorText}`);
        throw new Error(`Login failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('[Auth] Login bem-sucedido, dados recebidos:', { 
        user: data.user,
        tokenRecebido: !!data.token,
        tokenTamanho: data.token ? data.token.length : 0
      });
      
      // Limpar qualquer autenticação anterior
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Armazenar token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      console.log('[Auth] Token e usuário armazenados no localStorage');
      
      return data;
    } catch (error) {
      console.error('[Auth] Erro em login:', error);
      throw error;
    }
  },
  
  isAuthenticated: () => {
    const isAuth = !!localStorage.getItem('auth_token');
    if (ENABLE_REQUEST_LOGGING) {
      console.log('Verificando autenticação:', isAuth);
    }
    return isAuth;
  },
  
  logout: () => {
    if (ENABLE_REQUEST_LOGGING) {
      console.log('Fazendo logout e removendo dados de autenticação');
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return true;
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
}; 