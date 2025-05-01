import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Listar todos os itens de inventário
 * @route GET /api/inventory-items
 */
export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const status = req.query.status as string;
    const category = req.query.category as string;
    const search = req.query.search as string;
    
    // Construir o objeto where com base nos filtros
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { serial_number: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Buscar itens de inventário com paginação
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: [
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.inventoryItem.count({ where })
    ]);
    
    return res.json({
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar itens de inventário:', error);
    return res.status(500).json({ error: 'Erro ao buscar itens de inventário' });
  }
};

/**
 * Obter um item de inventário por ID
 * @route GET /api/inventory-items/:id
 */
export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
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
    
    // Validação básica
    if (!name || !category || !quantity || !unit_price) {
      return res.status(400).json({ 
        error: 'Nome, categoria, quantidade e preço unitário são obrigatórios' 
      });
    }
    
    // Criar item de inventário
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        description,
        category,
        quantity,
        unit_price,
        status: status || 'active',
        supplier,
        location,
        serial_number,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
        notes
      }
    });
    
    return res.status(201).json({
      message: 'Item de inventário criado com sucesso',
      item
    });
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
    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item de inventário não encontrado' });
    }
    
    // Atualizar item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        category: category || undefined,
        quantity: quantity !== undefined ? quantity : undefined,
        unit_price: unit_price !== undefined ? unit_price : undefined,
        status: status || undefined,
        supplier: supplier !== undefined ? supplier : undefined,
        location: location !== undefined ? location : undefined,
        serial_number: serial_number !== undefined ? serial_number : undefined,
        purchase_date: purchase_date ? new Date(purchase_date) : undefined,
        warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return res.json({
      message: 'Item de inventário atualizado com sucesso',
      item: updatedItem
    });
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
    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item de inventário não encontrado' });
    }
    
    // Excluir item
    await prisma.inventoryItem.delete({
      where: { id }
    });
    
    return res.json({ message: 'Item de inventário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item de inventário:', error);
    return res.status(500).json({ error: 'Erro ao excluir item de inventário' });
  }
}; 