// Simulação local do SDK Base44
// Esta é uma implementação local que substitui a dependência externa
// FALLBACK CLIENT - UTILIZADO APENAS QUANDO A API REAL FALHA

// Função para criar um serviço de entidade local que simula chamadas de API
const createEntityService = (entityName) => {
  const getStorageKey = () => `local_${entityName.toLowerCase()}`;
  
  // Inicializa o armazenamento local se não existir
  const initStorage = () => {
    if (!localStorage.getItem(getStorageKey())) {
      localStorage.setItem(getStorageKey(), JSON.stringify([]));
    }
  };
  
  // Obtém os dados do localStorage
  const getData = () => {
    initStorage();
    return JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
  };
  
  // Salva os dados no localStorage
  const saveData = (data) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
  };
  
  return {
    // Lista todos os itens
    list: async () => {
      console.warn(`[FALLBACK] Usando armazenamento local para ${entityName} ao invés da API.`);
      return getData();
    },
    
    // Obtém um item por ID
    get: async (id) => {
      console.warn(`[FALLBACK] Usando armazenamento local para ${entityName} ao invés da API.`);
      const data = getData();
      return data.find(item => item.id === id) || null;
    },
    
    // Cria um novo item
    create: async (itemData) => {
      console.warn(`[FALLBACK] Usando armazenamento local para ${entityName} ao invés da API.`);
      const data = getData();
      const newItem = {
        ...itemData,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.push(newItem);
      saveData(data);
      return newItem;
    },
    
    // Atualiza um item existente
    update: async (id, itemData) => {
      console.warn(`[FALLBACK] Usando armazenamento local para ${entityName} ao invés da API.`);
      const data = getData();
      const index = data.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      const updatedItem = {
        ...data[index],
        ...itemData,
        updatedAt: new Date().toISOString()
      };
      
      data[index] = updatedItem;
      saveData(data);
      return updatedItem;
    },
    
    // Remove um item
    delete: async (id) => {
      console.warn(`[FALLBACK] Usando armazenamento local para ${entityName} ao invés da API.`);
      const data = getData();
      const filtered = data.filter(item => item.id !== id);
      
      if (filtered.length === data.length) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      saveData(filtered);
      return { success: true };
    },
    
    // Métodos adicionais específicos podem ser adicionados conforme necessário
    query: async (filters) => {
      console.warn(`[FALLBACK] Usando armazenamento local para ${entityName} ao invés da API.`);
      const data = getData();
      // Implementação simplificada de filtragem
      if (!filters) return data;
      
      return data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }
  };
};

// Implementação de autenticação local
const createAuthService = () => {
  return {
    // Login local simples
    login: async (email, password) => {
      console.warn(`[FALLBACK] Usando autenticação local ao invés da API.`);
      // Buscar usuários do localStorage
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Criar token JWT simulado
      const token = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Armazenar informações de autenticação
      localStorage.setItem('local_auth', JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }));
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    },
    
    // Verifica se está autenticado
    isAuthenticated: () => {
      const auth = localStorage.getItem('local_auth');
      return !!auth;
    },
    
    // Logout
    logout: () => {
      localStorage.removeItem('local_auth');
      return true;
    },
    
    // Obtém usuário atual
    getCurrentUser: () => {
      const auth = JSON.parse(localStorage.getItem('local_auth') || 'null');
      return auth ? auth.user : null;
    }
  };
};

// Criação de entidades comuns
const entities = {
  Customer: createEntityService('Customer'),
  NetworkIssue: createEntityService('NetworkIssue'),
  Invoice: createEntityService('Invoice'),
  Equipment: createEntityService('Equipment'),
  SupportTicket: createEntityService('SupportTicket'),
  Contract: createEntityService('Contract'),
  ContractTemplate: createEntityService('ContractTemplate'),
  DigitalSignature: createEntityService('DigitalSignature'),
  Payment: createEntityService('Payment'),
  Subscription: createEntityService('Subscription'),
  Plan: createEntityService('Plan'),
  EquipmentBrand: createEntityService('EquipmentBrand'),
  InventoryItem: createEntityService('InventoryItem'),
  InventoryTransaction: createEntityService('InventoryTransaction'),
  Supplier: createEntityService('Supplier'),
  SystemConfig: createEntityService('SystemConfig'),
  UserRole: createEntityService('UserRole'),
  FinancialTransaction: createEntityService('FinancialTransaction'),
  Vehicle: createEntityService('Vehicle'),
  FuelRefill: createEntityService('FuelRefill'),
  MileageLog: createEntityService('MileageLog'),
  Driver: createEntityService('Driver'),
  PaymentGateway: createEntityService('PaymentGateway'),
  BillingSchedule: createEntityService('BillingSchedule'),
  RouterIntegration: createEntityService('RouterIntegration'),
  IPPool: createEntityService('IPPool'),
  IPAssignment: createEntityService('IPAssignment'),
  NetworkNode: createEntityService('NetworkNode'),
  ServicePlan: createEntityService('ServicePlan'),
  FinancialReport: createEntityService('FinancialReport'),
  BillingBatch: createEntityService('BillingBatch'),
  Bill: createEntityService('Bill')
};

// Integrações simuladas
const integrations = {
  Core: {
    InvokeLLM: async () => ({ response: "Simulação de resposta LLM" }),
    SendEmail: async () => ({ success: true }),
    SendSMS: async () => ({ success: true }),
    UploadFile: async () => ({ fileUrl: "https://example.com/simulated-file.pdf" }),
    GenerateImage: async () => ({ imageUrl: "https://example.com/simulated-image.png" }),
    ExtractDataFromUploadedFile: async () => ({ data: {} })
  }
};

// Cliente Base44 simulado
export const base44 = {
  entities,
  integrations,
  auth: createAuthService()
};

// Inicializar dados padrão para o sistema
const initializeSystemData = () => {
  // Exemplo: Configuração padrão do sistema
  if (!localStorage.getItem('local_systemconfig')) {
    localStorage.setItem('local_systemconfig', JSON.stringify([{
      id: "default_config",
      company_name: "ISP Manager",
      company_logo_url: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]));
  }
  
  // Exemplo: Usuário administrador padrão
  if (!localStorage.getItem('local_users')) {
    localStorage.setItem('local_users', JSON.stringify([{
      id: "admin_user",
      name: "Administrador",
      email: "admin@admin.com",
      password: "admin",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]));
  }
};

// Inicializar dados apenas se estiver em ambiente de desenvolvimento
if (import.meta.env.DEV) {
  console.log('[FALLBACK] Inicializando dados de fallback para desenvolvimento');
  initializeSystemData();
}
