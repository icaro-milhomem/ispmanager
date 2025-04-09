// Cliente personalizado para SystemConfig com fallback para localStorage
import { 
  API_BASE_URL, 
  getDefaultHeaders, 
  handleApiError, 
  ENABLE_REQUEST_LOGGING 
} from './apiConfig';
import axios from 'axios';

const STORAGE_KEY = 'system-config-data';
const STORAGE_VERSION = 'v1'; // Versão para controle de mudanças no formato dos dados
const LAST_UPDATE_KEY = 'system-config-last-update';

// Correta URL da API para system config
const SYSTEM_CONFIG_API_URL = `${API_BASE_URL}/api/config`;

// Função para registrar logs consistentemente
const logInfo = (message, data) => {
  if (ENABLE_REQUEST_LOGGING) {
    console.log(`[SystemConfigClient] ${message}`, data ? data : '');
  }
};

const logError = (message, error) => {
  console.error(`[SystemConfigClient] ${message}`, error);
};

const logWarn = (message) => {
  console.warn(`[SystemConfigClient] ${message}`);
};

// Remover todas as entradas antigas do localStorage relacionadas às configurações
const cleanupOldData = () => {
  logInfo("Limpando dados antigos do localStorage...");
  try {
    localStorage.removeItem('system_config');
    logInfo("Dados antigos removidos!");
    return true;
  } catch (error) {
    logError("Erro ao limpar dados antigos:", error);
    return false;
  }
};

// Verificar integridade dos dados no localStorage
const checkStorageIntegrity = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return false;
    
    const data = JSON.parse(serialized);
    if (!data) return false;
    
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
    if (!lastUpdate) return false;
    
    // Se os dados passarem nas verificações, estão íntegros
    return true;
  } catch (error) {
    logError("Erro ao verificar integridade dos dados:", error);
    return false;
  }
};

// Função para converter URLs para base64 (usado para imagens salvas anteriormente)
const processImageUrl = async (config) => {
  // Se não houver configuração ou URL do logo, retorna a configuração original
  if (!config || !config.company_logo_url) return config;
  
  logInfo("Verificando URL da imagem:", config.company_logo_url?.substring(0, 30) + "...");
  
  // Se a URL já for base64, retorna a configuração original
  if (config.company_logo_url?.startsWith('data:')) {
    logInfo("Já é base64, mantendo como está");
    return config;
  }
  
  try {
    // Se for uma URL que não é base64, tenta convertê-la
    if (config.company_logo_url?.startsWith('http')) {
      logInfo('Tentando converter URL para base64:', config.company_logo_url);
      
      // Cria uma imagem SVG de fallback para usar caso a conversão falhe
      const fallbackImage = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0 0 150 50'%3E%3Crect fill='%23f0f0f0' width='150' height='50'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ELogo%3C/text%3E%3C/svg%3E`;
      
      try {
        // Tenta buscar a imagem
        const response = await fetch(config.company_logo_url, { mode: 'no-cors' });
        
        if (response.ok) {
          const blob = await response.blob();
          
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                ...config,
                company_logo_url: reader.result
              });
            };
            reader.readAsDataURL(blob);
          });
        } else {
          logWarn("Não foi possível obter a imagem, usando fallback");
          return {
            ...config,
            company_logo_url: fallbackImage
          };
        }
      } catch (fetchError) {
        logError("Erro ao buscar imagem:", fetchError);
        return {
          ...config,
          company_logo_url: fallbackImage
        };
      }
    }
    
    // Se não for base64 nem URL, usa uma imagem de fallback
    logWarn("URL não reconhecida, usando fallback");
    return {
      ...config,
      company_logo_url: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0 0 150 50'%3E%3Crect fill='%23f0f0f0' width='150' height='50'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ELogo%3C/text%3E%3C/svg%3E`
    };
  } catch (error) {
    logError('Erro ao processar URL da imagem:', error);
    return {
      ...config,
      company_logo_url: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='50' viewBox='0 0 150 50'%3E%3Crect fill='%23f0f0f0' width='150' height='50'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EErro%3C/text%3E%3C/svg%3E`
    };
  }
};

/**
 * Salva as configurações no localStorage com verificação de integridade
 * @param {Array|Object} data - Dados para salvar
 * @returns {boolean} - Sucesso da operação
 */
const saveToLocalStorage = (data) => {
  try {
    // Limpar dados antigos para evitar conflitos
    cleanupOldData();
    
    // Salvar dados atuais
    const dataWithVersion = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data
    };
    
    const serialized = JSON.stringify(dataWithVersion);
    
    // Tenta salvar os dados
    localStorage.setItem(STORAGE_KEY, serialized);
    
    // Salva a marca de tempo da última atualização
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
    
    // Verifica se os dados foram salvos corretamente
    const integrity = checkStorageIntegrity();
    
    if (integrity) {
      logInfo("Dados salvos no localStorage com sucesso e verificados");
      return true;
    } else {
      logWarn("Dados foram salvos, mas a verificação de integridade falhou");
      return false;
    }
  } catch (error) {
    logError("Erro ao salvar no localStorage:", error);
    
    // Tenta verificar se é um erro de cota excedida
    if (error instanceof DOMException && 
        (error.name === 'QuotaExceededError' || 
         error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      logWarn("Cota de armazenamento excedida. Tentando limpar dados antigos...");
      
      // Tenta limpar outros dados para liberar espaço
      try {
        localStorage.clear();
        // Tenta novamente após limpar
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
        logInfo("Dados salvos após limpar armazenamento");
        return true;
      } catch (retryError) {
        logError("Falha ao salvar mesmo após limpar armazenamento:", retryError);
        return false;
      }
    }
    
    return false;
  }
};

/**
 * Recupera configurações do localStorage com verificação
 * @returns {Array|Object|null} - Dados recuperados ou null se falhar
 */
const getFromLocalStorage = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      logInfo("Nenhum dado encontrado no localStorage");
      return null;
    }
    
    const parsed = JSON.parse(serialized);
    
    // Verifica a versão dos dados
    if (parsed.version !== STORAGE_VERSION) {
      logWarn(`Versão dos dados incompatível: ${parsed.version} vs ${STORAGE_VERSION}`);
      return null;
    }
    
    logInfo("Dados recuperados do localStorage com sucesso");
    return parsed.data;
  } catch (error) {
    logError("Erro ao recuperar dados do localStorage:", error);
    return null;
  }
};

// Inicialização - verificar integridade dos dados no carregamento
(function initStorage() {
  if (!checkStorageIntegrity()) {
    logWarn("Dados no localStorage estão corrompidos ou ausentes, limpando...");
    cleanupOldData();
  } else {
    logInfo("Verificação de integridade dos dados concluída com sucesso");
  }
})();

// SystemConfig Client com fallback para localStorage
export const SystemConfigClient = {
  // Listar todas as configurações
  list: async () => {
    try {
      // Tenta buscar da API primeiro
      try {
        logInfo('Tentando buscar configurações do sistema da API');
        
        const response = await fetch(SYSTEM_CONFIG_API_URL, {
          method: 'GET',
          headers: getDefaultHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          logInfo('Configurações obtidas da API:', data);
          
          // Processando URLs de imagens se necessário
          if (Array.isArray(data)) {
            const processedData = await Promise.all(data.map(processImageUrl));
            
            // Salva no localStorage para uso offline
            saveToLocalStorage(processedData);
            
            return processedData;
          }
          
          const processedData = await processImageUrl(data);
          const dataArray = Array.isArray(processedData) ? processedData : [processedData];
          
          // Salva no localStorage para uso offline
          saveToLocalStorage(dataArray);
          
          return dataArray;
        }
        
        logWarn("API de configurações não disponível, usando localStorage");
        throw new Error("API indisponível");
      } catch (error) {
        // Fallback para localStorage
        const cachedConfig = getFromLocalStorage();
        
        if (cachedConfig) {
          logInfo("Usando configurações do localStorage");
          return Array.isArray(cachedConfig) ? cachedConfig : [cachedConfig];
        }
        
        // Verifica o formato antigo como última tentativa
        const storedConfig = localStorage.getItem('system_config');
        if (storedConfig) {
          logInfo("Usando configurações do formato antigo no localStorage");
          
          try {
            const parsedConfig = JSON.parse(storedConfig);
            // Processando URLs de imagens se necessário
            const processedConfig = await processImageUrl(parsedConfig);
            
            // Migra para o novo formato
            saveToLocalStorage([processedConfig]);
            
            return [processedConfig];
          } catch (parseError) {
            logError("Erro ao analisar JSON do localStorage:", parseError);
            return [];
          }
        }
        
        logInfo("Nenhuma configuração encontrada no localStorage");
        return [];
      }
    } catch (error) {
      logError("Erro ao buscar configurações:", error);
      return [];
    }
  },
  
  // Criar nova configuração
  create: async (config) => {
    try {
      // Processar imagens se necessário
      const processedConfig = await processImageUrl(config);
      logInfo("Configuração processada para criação:", processedConfig);
      
      // Tentar API primeiro
      logInfo(`Tentando criar configuração na API: ${SYSTEM_CONFIG_API_URL}`);
      
      try {
        const response = await axios.post(SYSTEM_CONFIG_API_URL, processedConfig, {
          headers: getDefaultHeaders()
        });
        
        if (response.status === 201 || response.status === 200) {
          logInfo("Configuração criada com sucesso na API", response.data);
          
          // Salvar no localStorage para uso offline
          saveToLocalStorage(Array.isArray(response.data) ? response.data : [response.data]);
          
          return response.data;
        } else {
          throw new Error(`Falha na API: ${response.status}`);
        }
      } catch (apiError) {
        // Em caso de falha da API, salvar no localStorage
        logInfo("API indisponível para criação, salvando no localStorage");
        
        const configToSave = {
          ...processedConfig,
          id: Date.now(), // ID temporário
          createdAt: new Date().toISOString()
        };
        
        const saved = saveToLocalStorage([configToSave]);
        
        if (saved) {
          return { ...configToSave, success: true };
        } else {
          throw new Error("Falha ao salvar no localStorage");
        }
      }
    } catch (error) {
      logError("Erro ao criar configuração:", error);
      throw error;
    }
  },
  
  // Atualizar configuração existente
  update: async (idOrConfig, configData) => {
    try {
      // Verificar se o primeiro parâmetro é um objeto ou um ID
      let id, config;
      
      if (typeof idOrConfig === 'object') {
        // Se for objeto, extrair o id e usar o próprio objeto como config
        id = idOrConfig.id;
        config = idOrConfig;
        console.log(`Atualizando usando objeto completo. ID: ${id}`);
      } else {
        // Caso contrário, usar como id e o segundo parâmetro como config
        id = idOrConfig;
        config = configData;
        console.log(`Atualizando usando id e config separados. ID: ${id}`);
      }
      
      if (!id) {
        throw new Error('ID é obrigatório para atualização');
      }
      
      // Processar imagens se necessário
      const processedConfig = await processImageUrl(config);
      logInfo(`Tentando atualizar configuração ${id} na API`);
      
      try {
        const response = await axios.put(`${SYSTEM_CONFIG_API_URL}/${id}`, processedConfig, {
          headers: getDefaultHeaders()
        });
        
        if (response.status === 200) {
          logInfo("Configuração atualizada com sucesso na API", response.data);
          
          // Atualizar no localStorage para uso offline
          const currentConfig = await SystemConfigClient.list();
          const updatedIndex = currentConfig.findIndex(c => c.id === id);
          
          if (updatedIndex !== -1) {
            currentConfig[updatedIndex] = response.data;
            saveToLocalStorage(currentConfig);
          }
          
          return response.data;
        } else {
          throw new Error(`Falha na API: ${response.status}`);
        }
      } catch (apiError) {
        logError("Erro ao atualizar configuração:", apiError);
        
        // Tentar atualizar no localStorage em caso de falha da API
        const currentConfig = await SystemConfigClient.list();
        const updatedIndex = currentConfig.findIndex(c => c.id === id);
        
        if (updatedIndex !== -1) {
          currentConfig[updatedIndex] = {
            ...currentConfig[updatedIndex],
            ...processedConfig,
            updatedAt: new Date().toISOString()
          };
          
          const saved = saveToLocalStorage(currentConfig);
          
          if (saved) {
            return { ...currentConfig[updatedIndex], success: true };
          }
        }
        
        throw apiError;
      }
    } catch (error) {
      logError("Erro ao atualizar configuração:", error);
      throw error;
    }
  },
  
  // Excluir configuração
  delete: async (id) => {
    try {
      logInfo(`Tentando excluir configuração ${id} da API`);
      
      try {
        const response = await axios.delete(`${SYSTEM_CONFIG_API_URL}/${id}`, {
          headers: getDefaultHeaders()
        });
        
        if (response.status === 200) {
          logInfo("Configuração excluída com sucesso da API");
          
          // Remover do localStorage para uso offline
          const currentConfig = await SystemConfigClient.list();
          const filteredConfig = currentConfig.filter(c => c.id !== id);
          saveToLocalStorage(filteredConfig);
          
          return { success: true };
        } else {
          throw new Error(`Falha na API: ${response.status}`);
        }
      } catch (apiError) {
        // Em caso de falha da API, remover do localStorage
        logInfo("API indisponível para exclusão, removendo do localStorage");
        
        const currentConfig = await SystemConfigClient.list();
        const filteredConfig = currentConfig.filter(c => c.id !== id);
        
        const saved = saveToLocalStorage(filteredConfig);
        
        if (saved) {
          return { success: true };
        } else {
          throw new Error("Falha ao atualizar localStorage");
        }
      }
    } catch (error) {
      logError("Erro ao excluir configuração:", error);
      throw error;
    }
  },
  
  // Obter configuração por ID
  get: async (id) => {
    try {
      logInfo(`Buscando configuração com ID ${id}`);
      
      // Tentar API primeiro
      try {
        const response = await axios.get(`${SYSTEM_CONFIG_API_URL}/${id}`, {
          headers: getDefaultHeaders()
        });
        
        if (response.status === 200) {
          logInfo("Configuração obtida da API", response.data);
          return await processImageUrl(response.data);
        } else {
          throw new Error(`Falha na API: ${response.status}`);
        }
      } catch (apiError) {
        // Em caso de falha da API, buscar do localStorage
        logInfo("API indisponível, buscando do localStorage");
        
        const cachedConfig = await SystemConfigClient.list();
        const config = cachedConfig.find(c => c.id === id);
        
        if (config) {
          return config;
        } else {
          throw new Error(`Configuração com ID ${id} não encontrada`);
        }
      }
    } catch (error) {
      logError(`Erro ao buscar configuração ${id}:`, error);
      throw error;
    }
  },
  
  // Verifica se há dados no localStorage
  hasLocalData: () => {
    return checkStorageIntegrity();
  },
  
  // Limpa dados locais forçadamente
  clearLocalData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_UPDATE_KEY);
      cleanupOldData();
      logInfo("Todos os dados locais foram limpos");
      return true;
    } catch (error) {
      logError("Erro ao limpar dados locais:", error);
      return false;
    }
  }
}; 