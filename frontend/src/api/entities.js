import { createEntityClient, authClient } from './apiClient';

// Entidades principais
export const Customer = createEntityClient('customers');
export const Plan = createEntityClient('plans');
export const SupportTicket = createEntityClient('tickets');
export const Contract = createEntityClient('contracts');
export const NetworkIssue = createEntityClient('network-issues');
export const Equipment = createEntityClient('equipment');
export const IPPool = createEntityClient('ip-pools');
export const Invoice = createEntityClient('invoices');
export const Payment = createEntityClient('payments');
export const Subscription = createEntityClient('subscriptions');

// FuelRefill com dados simulados enquanto a API não está implementada
export const FuelRefill = {
  list: async (params = {}) => {
    console.log("Tentando carregar FuelRefills com parâmetros:", params);
    const mockRefills = [
      {
        id: "1",
        vehicle_id: "1",
        driver_id: "1",
        date: "2023-11-10T08:15:00Z",
        liters: 45.2,
        price_per_liter: 5.25,
        total_cost: 237.30,
        fuel_type: "gasolina",
        odometer: 42500,
        full_tank: true,
        station: "Posto Ipiranga",
        notes: "Abastecimento regular",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        vehicle_id: "2",
        driver_id: "2",
        date: "2023-11-08T14:30:00Z",
        liters: 35.8,
        price_per_liter: 5.15,
        total_cost: 184.37,
        fuel_type: "etanol",
        odometer: 61200,
        full_tank: true,
        station: "Posto Shell",
        notes: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        vehicle_id: "1",
        driver_id: "1",
        date: "2023-11-02T17:45:00Z",
        liters: 40.5,
        price_per_liter: 5.29,
        total_cost: 214.25,
        fuel_type: "gasolina",
        odometer: 42100,
        full_tank: false,
        station: "Posto BR",
        notes: "Abastecimento emergencial",
        createdAt: new Date().toISOString()
      },
      {
        id: "4",
        vehicle_id: "3",
        driver_id: "3",
        date: "2023-11-05T09:20:00Z",
        liters: 62.5,
        price_per_liter: 6.30,
        total_cost: 393.75,
        fuel_type: "diesel",
        odometer: 28500,
        full_tank: true,
        station: "Posto Petrobras",
        notes: "",
        createdAt: new Date().toISOString()
      }
    ];
    
    try {
      // Tentar chamar o endpoint real, mas com fallback para o mock
      const realRefills = await createEntityClient('fuel-refills').list(params);
      if (realRefills && Array.isArray(realRefills) && realRefills.length > 0) {
        console.log("Dados reais obtidos do backend para FuelRefill");
        return realRefills;
      }
    } catch (error) {
      console.warn("Usando dados simulados para FuelRefill", error);
    }
    
    return mockRefills;
  },
  
  get: async (id) => {
    try {
      const realRefill = await createEntityClient('fuel-refills').get(id);
      if (realRefill) {
        return realRefill;
      }
    } catch (error) {
      console.warn("Usando dados simulados para FuelRefill.get", error);
    }
    
    const refills = await FuelRefill.list();
    return refills.find(refill => refill.id === id) || null;
  },
  
  create: async (data) => {
    try {
      const realRefill = await createEntityClient('fuel-refills').create(data);
      if (realRefill) {
        return realRefill;
      }
    } catch (error) {
      console.warn("Usando dados simulados para FuelRefill.create", error);
    }
    
    return {
      ...data,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
  },
  
  update: async (id, data) => {
    try {
      const realRefill = await createEntityClient('fuel-refills').update(id, data);
      if (realRefill) {
        return realRefill;
      }
    } catch (error) {
      console.warn("Usando dados simulados para FuelRefill.update", error);
    }
    
    return {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };
  },
  
  delete: async (id) => {
    try {
      const result = await createEntityClient('fuel-refills').delete(id);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn("Usando dados simulados para FuelRefill.delete", error);
    }
    
    return { success: true };
  }
};

// MileageLog com dados simulados enquanto a API não está implementada
export const MileageLog = {
  list: async (params = {}) => {
    console.log("Tentando carregar MileageLogs com parâmetros:", params);
    const mockLogs = [
      {
        id: "1",
        vehicle_id: "1",
        driver_id: "1",
        date: "2023-11-10T18:00:00Z",
        start_odometer: 42500,
        end_odometer: 42650,
        distance: 150,
        purpose: "Visita técnica",
        start_location: "Sede",
        end_location: "Cliente ABC",
        notes: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        vehicle_id: "2",
        driver_id: "2",
        date: "2023-11-09T12:30:00Z",
        start_odometer: 61200,
        end_odometer: 61280,
        distance: 80,
        purpose: "Entrega de equipamentos",
        start_location: "Sede",
        end_location: "Cliente XYZ",
        notes: "Trânsito intenso",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        vehicle_id: "3",
        driver_id: "3",
        date: "2023-11-08T09:15:00Z",
        start_odometer: 28500,
        end_odometer: 28720,
        distance: 220,
        purpose: "Instalação de fibra",
        start_location: "Sede",
        end_location: "Bairro Norte",
        notes: "",
        createdAt: new Date().toISOString()
      },
      {
        id: "4",
        vehicle_id: "1",
        driver_id: "1",
        date: "2023-11-06T14:45:00Z",
        start_odometer: 42300,
        end_odometer: 42500,
        distance: 200,
        purpose: "Manutenção de torre",
        start_location: "Sede",
        end_location: "Torre Sul",
        notes: "Equipamentos pesados",
        createdAt: new Date().toISOString()
      }
    ];
    
    try {
      // Tentar chamar o endpoint real, mas com fallback para o mock
      const realLogs = await createEntityClient('mileage-logs').list(params);
      if (realLogs && Array.isArray(realLogs) && realLogs.length > 0) {
        console.log("Dados reais obtidos do backend para MileageLog");
        return realLogs;
      }
    } catch (error) {
      console.warn("Usando dados simulados para MileageLog", error);
    }
    
    return mockLogs;
  },
  
  get: async (id) => {
    try {
      const realLog = await createEntityClient('mileage-logs').get(id);
      if (realLog) {
        return realLog;
      }
    } catch (error) {
      console.warn("Usando dados simulados para MileageLog.get", error);
    }
    
    const logs = await MileageLog.list();
    return logs.find(log => log.id === id) || null;
  },
  
  create: async (data) => {
    try {
      const realLog = await createEntityClient('mileage-logs').create(data);
      if (realLog) {
        return realLog;
      }
    } catch (error) {
      console.warn("Usando dados simulados para MileageLog.create", error);
    }
    
    return {
      ...data,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
  },
  
  update: async (id, data) => {
    try {
      const realLog = await createEntityClient('mileage-logs').update(id, data);
      if (realLog) {
        return realLog;
      }
    } catch (error) {
      console.warn("Usando dados simulados para MileageLog.update", error);
    }
    
    return {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };
  },
  
  delete: async (id) => {
    try {
      const result = await createEntityClient('mileage-logs').delete(id);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn("Usando dados simulados para MileageLog.delete", error);
    }
    
    return { success: true };
  }
};

// Vehicle com dados simulados enquanto a API não está implementada
export const Vehicle = {
  list: async (params = {}) => {
    console.log("Tentando carregar Vehicles com parâmetros:", params);
    const mockVehicles = [
      {
        id: "1",
        plate: "ABC-1234",
        model: "Fiat Strada",
        year: 2020,
        type: "pickup",
        status: "ativo",
        fuel_type: "flex",
        capacity: 54,
        driver_id: "1",
        driver_name: "João Silva",
        odometer: 45000,
        last_maintenance: "2023-09-15T10:00:00Z",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        plate: "DEF-5678",
        model: "VW Gol",
        year: 2019,
        type: "hatch",
        status: "ativo",
        fuel_type: "flex",
        capacity: 48,
        driver_id: "2",
        driver_name: "Maria Oliveira",
        odometer: 62500,
        last_maintenance: "2023-10-20T10:00:00Z",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        plate: "GHI-9012",
        model: "Nissan Frontier",
        year: 2021,
        type: "pickup",
        status: "manutenção",
        fuel_type: "diesel",
        capacity: 80,
        driver_id: "3",
        driver_name: "Pedro Santos",
        odometer: 28900,
        last_maintenance: "2023-11-05T10:00:00Z",
        createdAt: new Date().toISOString()
      }
    ];
    
    try {
      // Tentar chamar o endpoint real, mas com fallback para o mock
      const realVehicles = await createEntityClient('vehicles').list(params);
      if (realVehicles && Array.isArray(realVehicles) && realVehicles.length > 0) {
        console.log("Dados reais obtidos do backend para Vehicle");
        return realVehicles;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Vehicle", error);
    }
    
    return mockVehicles;
  },
  
  get: async (id) => {
    try {
      const realVehicle = await createEntityClient('vehicles').get(id);
      if (realVehicle) {
        return realVehicle;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Vehicle.get", error);
    }
    
    const vehicles = await Vehicle.list();
    return vehicles.find(vehicle => vehicle.id === id) || null;
  },
  
  create: async (data) => {
    try {
      const realVehicle = await createEntityClient('vehicles').create(data);
      if (realVehicle) {
        return realVehicle;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Vehicle.create", error);
    }
    
    return {
      ...data,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
  },
  
  update: async (id, data) => {
    try {
      const realVehicle = await createEntityClient('vehicles').update(id, data);
      if (realVehicle) {
        return realVehicle;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Vehicle.update", error);
    }
    
    return {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };
  },
  
  delete: async (id) => {
    try {
      const result = await createEntityClient('vehicles').delete(id);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Vehicle.delete", error);
    }
    
    return { success: true };
  }
};

export const EquipmentBrand = createEntityClient('equipment-brands');
export const InventoryItem = createEntityClient('inventory-items');
export const InventoryTransaction = createEntityClient('inventory-transactions');
export const Supplier = createEntityClient('suppliers');
export const SystemConfig = createEntityClient('system-config');
export const UserRole = createEntityClient('user-roles');
export const FinancialTransaction = createEntityClient('financial-transactions');
export const User = createEntityClient('users');
export const ContractTemplate = createEntityClient('contract-templates');
export const DigitalSignature = createEntityClient('digital-signatures');

// Driver mockado com fallback para API real
export const Driver = {
  list: async (params = {}) => {
    console.log("Tentando carregar Drivers com parâmetros:", params);
    const mockDrivers = [
      {
        id: "1",
        name: "João Silva",
        document: "123.456.789-00",
        license_number: "12345678901",
        license_category: "B",
        license_expiry: "2024-05-15T00:00:00Z",
        phone: "(11) 98765-4321",
        email: "joao.silva@exemplo.com",
        status: "ativo",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Maria Oliveira",
        document: "987.654.321-00",
        license_number: "09876543210",
        license_category: "B",
        license_expiry: "2025-03-22T00:00:00Z",
        phone: "(11) 91234-5678",
        email: "maria.oliveira@exemplo.com",
        status: "ativo",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Pedro Santos",
        document: "456.789.123-00",
        license_number: "56789012345",
        license_category: "D",
        license_expiry: "2023-12-10T00:00:00Z",
        phone: "(11) 95555-9999",
        email: "pedro.santos@exemplo.com",
        status: "ativo",
        createdAt: new Date().toISOString()
      }
    ];
    
    try {
      // Tentar chamar o endpoint real, mas com fallback para o mock
      const realDrivers = await createEntityClient('drivers').list(params);
      if (realDrivers && Array.isArray(realDrivers) && realDrivers.length > 0) {
        console.log("Dados reais obtidos do backend para Driver");
        return realDrivers;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Driver", error);
    }
    
    return mockDrivers;
  },
  
  get: async (id) => {
    try {
      const realDriver = await createEntityClient('drivers').get(id);
      if (realDriver) {
        return realDriver;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Driver.get", error);
    }
    
    const drivers = await Driver.list();
    return drivers.find(driver => driver.id === id) || null;
  },
  
  create: async (data) => {
    try {
      const realDriver = await createEntityClient('drivers').create(data);
      if (realDriver) {
        return realDriver;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Driver.create", error);
    }
    
    return {
      ...data,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
  },
  
  update: async (id, data) => {
    try {
      const realDriver = await createEntityClient('drivers').update(id, data);
      if (realDriver) {
        return realDriver;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Driver.update", error);
    }
    
    return {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };
  },
  
  delete: async (id) => {
    try {
      const result = await createEntityClient('drivers').delete(id);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn("Usando dados simulados para Driver.delete", error);
    }
    
    return { success: true };
  }
};

export const PaymentGateway = createEntityClient('payment-gateways');
export const BillingSchedule = createEntityClient('billing-schedules');
export const RouterIntegration = createEntityClient('router-integrations');
export const IPAssignment = createEntityClient('ip-assignments');
export const NetworkNode = createEntityClient('network-nodes');
export const ServicePlan = createEntityClient('service-plans');
export const BillingBatch = createEntityClient('billing-batches');
export const Bill = createEntityClient('bills');
export const FinancialReport = createEntityClient('financial-reports');

// Expor Auth client
export const Auth = authClient;