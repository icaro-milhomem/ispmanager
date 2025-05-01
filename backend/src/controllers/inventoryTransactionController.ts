import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Listar todas as transações de inventário
 * @route GET /api/inventory-transactions
 */
export const getAllInventoryTransactions = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const type = req.query.type as string;
    const itemId = req.query.itemId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    // Construir o objeto where com base nos filtros
    const where: any = {};
    if (type) where.type = type;
    if (itemId) where.itemId = itemId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    // Buscar transações com paginação
    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          item: true
        },
        orderBy: [
          { date: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.inventoryTransaction.count({ where })
    ]);
    
    return res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar transações de inventário:', error);
    return res.status(500).json({ error: 'Erro ao buscar transações de inventário' });
  }
};

/**
 * Obter uma transação de inventário por ID
 * @route GET /api/inventory-transactions/:id
 */
export const getInventoryTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        item: true
      }
    });
    
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
      itemId, 
      type, 
      quantity, 
      date, 
      notes 
    } = req.body;
    
    // Validação básica
    if (!itemId || !type || !quantity) {
      return res.status(400).json({ 
        error: 'ID do item, tipo e quantidade são obrigatórios' 
      });
    }
    
    // Verificar se o item existe
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item de inventário não encontrado' });
    }
    
    // Verificar se há quantidade suficiente para saída
    if (type === 'out' && item.quantity < quantity) {
      return res.status(400).json({ 
        error: 'Quantidade insuficiente em estoque' 
      });
    }
    
    // Iniciar transação do banco de dados
    const result = await prisma.$transaction(async (tx) => {
      // Criar transação
      const transaction = await tx.inventoryTransaction.create({
        data: {
          itemId,
          type,
          quantity,
          date: date ? new Date(date) : new Date(),
          notes
        }
      });
      
      // Atualizar quantidade do item
      const newQuantity = type === 'in' 
        ? item.quantity + quantity 
        : item.quantity - quantity;
      
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: newQuantity }
      });
      
      return transaction;
    });
    
    return res.status(201).json({
      message: 'Transação de inventário criada com sucesso',
      transaction: result
    });
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
      itemId, 
      type, 
      quantity, 
      date, 
      notes 
    } = req.body;
    
    // Verificar se a transação existe
    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        item: true
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação de inventário não encontrada' });
    }
    
    // Verificar se o item existe (se foi alterado)
    if (itemId && itemId !== transaction.itemId) {
      const item = await prisma.inventoryItem.findUnique({
        where: { id: itemId }
      });
      
      if (!item) {
        return res.status(404).json({ error: 'Item de inventário não encontrado' });
      }
    }
    
    // Iniciar transação do banco de dados
    const result = await prisma.$transaction(async (tx) => {
      // Reverter quantidade anterior
      const oldQuantity = transaction.type === 'in' 
        ? transaction.item.quantity - transaction.quantity 
        : transaction.item.quantity + transaction.quantity;
      
      await tx.inventoryItem.update({
        where: { id: transaction.itemId },
        data: { quantity: oldQuantity }
      });
      
      // Atualizar transação
      const updatedTransaction = await tx.inventoryTransaction.update({
        where: { id },
        data: {
          itemId: itemId || undefined,
          type: type || undefined,
          quantity: quantity || undefined,
          date: date ? new Date(date) : undefined,
          notes: notes !== undefined ? notes : undefined
        },
        include: {
          item: true
        }
      });
      
      // Aplicar nova quantidade
      const newQuantity = updatedTransaction.type === 'in' 
        ? updatedTransaction.item.quantity + updatedTransaction.quantity 
        : updatedTransaction.item.quantity - updatedTransaction.quantity;
      
      await tx.inventoryItem.update({
        where: { id: updatedTransaction.itemId },
        data: { quantity: newQuantity }
      });
      
      return updatedTransaction;
    });
    
    return res.json({
      message: 'Transação de inventário atualizada com sucesso',
      transaction: result
    });
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
    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        item: true
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação de inventário não encontrada' });
    }
    
    // Iniciar transação do banco de dados
    await prisma.$transaction(async (tx) => {
      // Reverter quantidade
      const newQuantity = transaction.type === 'in' 
        ? transaction.item.quantity - transaction.quantity 
        : transaction.item.quantity + transaction.quantity;
      
      await tx.inventoryItem.update({
        where: { id: transaction.itemId },
        data: { quantity: newQuantity }
      });
      
      // Excluir transação
      await tx.inventoryTransaction.delete({
        where: { id }
      });
    });
    
    return res.json({ message: 'Transação de inventário excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir transação de inventário:', error);
    return res.status(500).json({ error: 'Erro ao excluir transação de inventário' });
  }
}; 