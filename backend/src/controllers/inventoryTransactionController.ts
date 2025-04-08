import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Simulação de banco de dados em memória
let inventoryTransactions: any[] = [
  {
    id: '1',
    type: 'ENTRADA',
    item_id: '1',
    quantity: 5,
    unit_price: 349.90,
    total_price: 1749.50,
    date: new Date('2024-03-15'),
    description: 'Compra de roteadores Mikrotik para estoque',
    reference_number: 'NF-23456',
    user_id: 'ccf6f644-cee3-4fe4-8bd5-61f45668b4e9',
    supplier: 'Distribuidora de Redes',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '2',
    type: 'SAÍDA',
    item_id: '1',
    quantity: 2,
    unit_price: 349.90,
    total_price: 699.80,
    date: new Date('2024-03-20'),
    description: 'Instalação em cliente',
    reference_number: 'OS-12345',
    user_id: 'ccf6f644-cee3-4fe4-8bd5-61f45668b4e9',
    customer_id: '5f8d4e3c-2b1a-9c8d-7e6f-5d4c3b2a1098',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: '3',
    type: 'ENTRADA',
    item_id: '2',
    quantity: 100,
    unit_price: 2.50,
    total_price: 250.00,
    date: new Date('2024-03-25'),
    description: 'Compra de cabo de rede',
    reference_number: 'NF-34567',
    user_id: 'ccf6f644-cee3-4fe4-8bd5-61f45668b4e9',
    supplier: 'Cabo Brasil',
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-03-25')
  }
];

/**
 * Listar todas as transações de inventário
 * @route GET /api/inventory-transactions
 */
export const getAllInventoryTransactions = async (req: Request, res: Response) => {
  try {
    return res.json(inventoryTransactions);
  } catch (error) {
    console.error('Erro ao buscar transações de inventário:', error);
    return res.status(500).json({ error: 'Erro ao buscar transações de inventário' });
  }
};

/**
 * Obter uma transação de inventário pelo ID
 * @route GET /api/inventory-transactions/:id
 */
export const getInventoryTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const transaction = inventoryTransactions.find(t => t.id === id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação de inventário não encontrada' });
    }
    
    return res.json(transaction);
  } catch (error) {
    console.error('Erro ao buscar transação de inventário:', error);
    return res.status(500).json({ error: 'Erro ao buscar transação de inventário' });
  }
};

/**
 * Criar uma nova transação de inventário
 * @route POST /api/inventory-transactions
 */
export const createInventoryTransaction = async (req: Request, res: Response) => {
  try {
    const {
      type,
      item_id,
      quantity,
      unit_price,
      date,
      description,
      reference_number,
      user_id,
      supplier,
      customer_id
    } = req.body;
    
    if (!type || !item_id || !quantity) {
      return res.status(400).json({ error: 'Tipo, ID do item e quantidade são obrigatórios' });
    }
    
    const total_price = (quantity * (unit_price || 0));
    
    const newTransaction = {
      id: uuidv4(),
      type,
      item_id,
      quantity,
      unit_price: unit_price || 0,
      total_price,
      date: date ? new Date(date) : new Date(),
      description,
      reference_number,
      user_id,
      supplier,
      customer_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    inventoryTransactions.push(newTransaction);
    
    return res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Erro ao criar transação de inventário:', error);
    return res.status(500).json({ error: 'Erro ao criar transação de inventário' });
  }
};

/**
 * Atualizar uma transação de inventário
 * @route PUT /api/inventory-transactions/:id
 */
export const updateInventoryTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      type,
      item_id,
      quantity,
      unit_price,
      date,
      description,
      reference_number,
      user_id,
      supplier,
      customer_id
    } = req.body;
    
    // Verificar se a transação existe
    const transactionIndex = inventoryTransactions.findIndex(t => t.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transação de inventário não encontrada' });
    }
    
    const existingTransaction = inventoryTransactions[transactionIndex];
    
    // Calcular novo preço total se quantidade ou preço unitário forem atualizados
    const newUnitPrice = unit_price !== undefined ? unit_price : existingTransaction.unit_price;
    const newQuantity = quantity !== undefined ? quantity : existingTransaction.quantity;
    const total_price = newQuantity * newUnitPrice;
    
    // Atualizar a transação
    const updatedTransaction = {
      ...existingTransaction,
      type: type || existingTransaction.type,
      item_id: item_id || existingTransaction.item_id,
      quantity: newQuantity,
      unit_price: newUnitPrice,
      total_price,
      date: date ? new Date(date) : existingTransaction.date,
      description: description !== undefined ? description : existingTransaction.description,
      reference_number: reference_number !== undefined ? reference_number : existingTransaction.reference_number,
      user_id: user_id || existingTransaction.user_id,
      supplier: supplier !== undefined ? supplier : existingTransaction.supplier,
      customer_id: customer_id !== undefined ? customer_id : existingTransaction.customer_id,
      updatedAt: new Date()
    };
    
    inventoryTransactions[transactionIndex] = updatedTransaction;
    
    return res.json(updatedTransaction);
  } catch (error) {
    console.error('Erro ao atualizar transação de inventário:', error);
    return res.status(500).json({ error: 'Erro ao atualizar transação de inventário' });
  }
};

/**
 * Excluir uma transação de inventário
 * @route DELETE /api/inventory-transactions/:id
 */
export const deleteInventoryTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se a transação existe
    const transactionIndex = inventoryTransactions.findIndex(t => t.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transação de inventário não encontrada' });
    }
    
    // Excluir a transação
    inventoryTransactions.splice(transactionIndex, 1);
    
    return res.json({ message: 'Transação de inventário excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir transação de inventário:', error);
    return res.status(500).json({ error: 'Erro ao excluir transação de inventário' });
  }
}; 