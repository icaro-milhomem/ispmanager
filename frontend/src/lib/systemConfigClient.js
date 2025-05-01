// Cliente para gerenciar configurações do sistema
const STORAGE_KEY = 'system_config';

// Inicializar configurações padrão
const defaultConfig = {
  theme: 'light',
  language: 'pt-BR',
  notifications: true,
  autoSave: true
};

// Função para validar configurações
const validateConfig = (config) => {
  try {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // Verificar se todas as chaves necessárias existem
    const requiredKeys = ['theme', 'language', 'notifications', 'autoSave'];
    return requiredKeys.every(key => key in config);
  } catch (error) {
    console.error('[SystemConfigClient] Erro ao validar configurações:', error);
    return false;
  }
};

// Inicializar storage
const initStorage = () => {
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY);
    
    if (!storedConfig) {
      console.log('[SystemConfigClient] Nenhuma configuração encontrada, usando padrão');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
      return defaultConfig;
    }

    const parsedConfig = JSON.parse(storedConfig);
    
    if (!validateConfig(parsedConfig)) {
      console.warn('[SystemConfigClient] Dados no localStorage estão corrompidos ou ausentes, limpando...');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
      return defaultConfig;
    }

    return parsedConfig;
  } catch (error) {
    console.error('[SystemConfigClient] Erro ao inicializar storage:', error);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
    return defaultConfig;
  }
};

// Obter configuração atual
export const getConfig = () => {
  return initStorage();
};

// Atualizar configuração
export const updateConfig = (newConfig) => {
  try {
    const currentConfig = getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    if (validateConfig(updatedConfig)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      return updatedConfig;
    }
    
    throw new Error('Configuração inválida');
  } catch (error) {
    console.error('[SystemConfigClient] Erro ao atualizar configuração:', error);
    throw error;
  }
};

// Resetar configurações para padrão
export const resetConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
  return defaultConfig;
};

// Inicializar ao carregar
initStorage(); 