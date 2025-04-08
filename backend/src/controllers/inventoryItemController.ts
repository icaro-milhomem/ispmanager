import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Simulação de banco de dados em memória
let inventoryItems: any[] = [
  {
    id: '1',
    name: 'Roteador Mikrotik hAP ac²',
    description: 'Roteador wireless de alta performance',
    category: 'Equipamento de Rede',
    quantity: 15,
    unit_price: 349.90,
    status: 'active',
    supplier: 'Distribuidora de Redes',
    location: 'Estoque Principal',
    serial_number: 'MK-AC2-78901',
    purchase_date: new Date('2024-01-15'),
    warranty_expiry: new Date('2026-01-15'),
    notes: 'Equipamentos para instalação em clientes de planos premium',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Cabo de Rede Cat6',
    description: 'Cabo de rede Categoria 6 para instalações',
    category: 'Materiais',
    quantity: 500,
    unit_price: 2.50,
    status: 'active',
    supplier: 'Cabo Brasil',
    location: 'Estoque Secundário',
    serial_number: null,
    purchase_date: new Date('2024-02-05'),
    warranty_expiry: null,
    notes: 'Medida em metros',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '3',
    name: 'ONU GPON',
    description: 'Optical Network Unit para conexões FTTH',
    category: 'Equipamento de Rede',
    quantity: 30,
    unit_price: 175.00,
    status: 'active',
    supplier: 'Optic Fibras',
    location: 'Estoque Principal',
    serial_number: 'ONU-GPON-001',
    purchase_date: new Date('2024-01-20'),
    warranty_expiry: new Date('2025-01-20'),
    notes: 'Para instalações em novos clientes de fibra',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '4',
    name: 'Switch 24 portas Gigabit',
    description: 'Switch gerenciável de 24 portas para data center',
    category: 'Equipamento de Rede',
    quantity: 5,
    unit_price: 1200.00,
    status: 'active',
    supplier: 'Network Pro',
    location: 'Estoque Seguro',
    serial_number: 'SW24G-12345',
    purchase_date: new Date('2023-11-10'),
    warranty_expiry: new Date('2025-11-10'),
    notes: 'Para expansão do data center',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-11-10')
  },
  {
    id: '5',
    name: 'Conector RJ45',
    description: 'Conectores para montagem de cabos de rede',
    category: 'Materiais',
    quantity: 1000,
    unit_price: 0.50,
    status: 'active',
    supplier: 'Conecta Tudo',
    location: 'Estoque de Materiais',
    serial_number: null,
    purchase_date: new Date('2024-02-15'),
    warranty_expiry: null,
    notes: 'Alta qualidade para instalações externas',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  }
];

/**
 * Listar todos os itens de inventário
 * @route GET /api/inventory-items
 */
export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    return res.json(inventoryItems);
  } catch (error) {
    console.error('Erro ao buscar itens de inventário:', error);
    return res.status(500).json({ error: 'Erro ao buscar itens de inventário' });
  }
};

/**
 * Obter um item de inventário pelo ID
 * @route GET /api/inventory-items/:id
 */
export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = inventoryItems.find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item de inventário não encontrado' });
    }
    
    return res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item de inventário:', error);
    return res.status(500).json({ error: 'Erro ao buscar item de inventário' });
  }
};

/**
 * Criar um novo item de inventário
 * @route POST /api/inventory-items
 */
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      quantity,
      unit_price,
      status,
      supplier,
      location,
      serial_number,
      purchase_date,
      warranty_expiry,
      notes
    } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
    }
    
    const newItem = {
      id: uuidv4(),
      name,
      description,
      category,
      quantity: quantity || 0,
      unit_price: unit_price || 0,
      status: status || 'active',
      supplier,
      location,
      serial_number,
      purchase_date: purchase_date ? new Date(purchase_date) : null,
      warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    inventoryItems.push(newItem);
    
    return res.status(201).json(newItem);
  } catch (error) {
    console.error('Erro ao criar item de inventário:', error);
    return res.status(500).json({ error: 'Erro ao criar item de inventário' });
  }
};

/**
 * Atualizar um item de inventário
 * @route PUT /api/inventory-items/:id
 */
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      quantity,
      unit_price,
      status,
      supplier,
      location,
      serial_number,
      purchase_date,
      warranty_expiry,
      notes
    } = req.body;
    
    // Verificar se o item existe
    const itemIndex = inventoryItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item de inventário não encontrado' });
    }
    
    const existingItem = inventoryItems[itemIndex];
    
    // Atualizar o item
    const updatedItem = {
      ...existingItem,
      name: name || existingItem.name,
      description: description !== undefined ? description : existingItem.description,
      category: category || existingItem.category,
      quantity: quantity !== undefined ? quantity : existingItem.quantity,
      unit_price: unit_price !== undefined ? unit_price : existingItem.unit_price,
      status: status || existingItem.status,
      supplier: supplier !== undefined ? supplier : existingItem.supplier,
      location: location !== undefined ? location : existingItem.location,
      serial_number: serial_number !== undefined ? serial_number : existingItem.serial_number,
      purchase_date: purchase_date ? new Date(purchase_date) : existingItem.purchase_date,
      warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : existingItem.warranty_expiry,
      notes: notes !== undefined ? notes : existingItem.notes,
      updatedAt: new Date()
    };
    
    inventoryItems[itemIndex] = updatedItem;
    
    return res.json(updatedItem);
  } catch (error) {
    console.error('Erro ao atualizar item de inventário:', error);
    return res.status(500).json({ error: 'Erro ao atualizar item de inventário' });
  }
};

/**
 * Excluir um item de inventário
 * @route DELETE /api/inventory-items/:id
 */
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o item existe
    const itemIndex = inventoryItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item de inventário não encontrado' });
    }
    
    // Excluir o item
    inventoryItems.splice(itemIndex, 1);
    
    return res.json({ message: 'Item de inventário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item de inventário:', error);
    return res.status(500).json({ error: 'Erro ao excluir item de inventário' });
  }
}; 