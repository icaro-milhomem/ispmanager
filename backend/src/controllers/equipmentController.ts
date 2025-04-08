import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os equipamentos
 */
export const getAllEquipments = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const status = req.query.status as string;
    const brand = req.query.brand as string;
    
    // Construir o objeto where com base nos filtros
    const where: any = {};
    if (status) where.status = status;
    if (brand) where.brand = brand;
    
    // Buscar equipamentos com paginação
    const [equipments, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.equipment.count({ where })
    ]);
    
    return res.json({
      equipments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um equipamento por ID
 */
export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const equipment = await prisma.equipment.findUnique({
      where: { id }
    });
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipamento não encontrado' });
    }
    
    return res.json(equipment);
  } catch (error) {
    console.error('Erro ao buscar equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo equipamento
 */
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      brand, 
      model, 
      serial, 
      status, 
      location, 
      notes 
    } = req.body;
    
    // Validação básica
    if (!name || !brand || !model) {
      return res.status(400).json({ 
        message: 'Nome, marca e modelo são obrigatórios' 
      });
    }
    
    // Verificar se o serial já existe (se foi informado)
    if (serial) {
      const existingEquipment = await prisma.equipment.findFirst({
        where: { serial }
      });
      
      if (existingEquipment) {
        return res.status(400).json({ 
          message: 'Já existe um equipamento com este número de série' 
        });
      }
    }
    
    // Criar equipamento
    const equipment = await prisma.equipment.create({
      data: {
        name,
        brand,
        model,
        serial,
        status: status || 'AVAILABLE',
        location,
        notes
      }
    });
    
    return res.status(201).json({
      message: 'Equipamento criado com sucesso',
      equipment
    });
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um equipamento
 */
export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      brand, 
      model, 
      serial, 
      status, 
      location, 
      notes 
    } = req.body;
    
    // Verificar se o equipamento existe
    const equipment = await prisma.equipment.findUnique({
      where: { id }
    });
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipamento não encontrado' });
    }
    
    // Verificar se o serial já existe (se foi alterado)
    if (serial && serial !== equipment.serial) {
      const serialExists = await prisma.equipment.findFirst({
        where: {
          serial,
          id: { not: id }
        }
      });
      
      if (serialExists) {
        return res.status(400).json({ message: 'Já existe um equipamento com este número de série' });
      }
    }
    
    // Atualizar dados
    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: {
        name: name || undefined,
        brand: brand || undefined,
        model: model || undefined,
        serial: serial !== undefined ? serial : undefined,
        status: status || undefined,
        location: location !== undefined ? location : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return res.json({
      message: 'Equipamento atualizado com sucesso',
      equipment: updatedEquipment
    });
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um equipamento
 */
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o equipamento existe
    const equipment = await prisma.equipment.findUnique({
      where: { id }
    });
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipamento não encontrado' });
    }
    
    // Remover equipamento
    await prisma.equipment.delete({
      where: { id }
    });
    
    return res.json({ message: 'Equipamento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 