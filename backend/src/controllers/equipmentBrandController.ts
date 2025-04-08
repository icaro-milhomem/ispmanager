import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todas as marcas de equipamentos
 */
export const getAllEquipmentBrands = async (req: Request, res: Response) => {
  try {
    // Buscar todas as marcas
    const brands = await prisma.equipmentBrand.findMany({
      orderBy: [
        { name: 'asc' }
      ]
    });
    
    return res.json(brands);
  } catch (error) {
    console.error('Erro ao buscar marcas de equipamentos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém uma marca de equipamento por ID
 */
export const getEquipmentBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const brand = await prisma.equipmentBrand.findUnique({
      where: { id }
    });
    
    if (!brand) {
      return res.status(404).json({ message: 'Marca não encontrada' });
    }
    
    return res.json(brand);
  } catch (error) {
    console.error('Erro ao buscar marca de equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria uma nova marca de equipamento
 */
export const createEquipmentBrand = async (req: Request, res: Response) => {
  try {
    const { name, description, website } = req.body;
    
    // Validação básica
    if (!name) {
      return res.status(400).json({ 
        message: 'Nome da marca é obrigatório'
      });
    }
    
    // Verificar se já existe uma marca com este nome
    const existingBrand = await prisma.equipmentBrand.findFirst({
      where: { name }
    });
    
    if (existingBrand) {
      return res.status(400).json({ 
        message: 'Já existe uma marca com este nome' 
      });
    }
    
    // Criar marca
    const brand = await prisma.equipmentBrand.create({
      data: {
        name,
        description,
        website
      }
    });
    
    return res.status(201).json({
      message: 'Marca criada com sucesso',
      brand
    });
  } catch (error) {
    console.error('Erro ao criar marca de equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza uma marca de equipamento
 */
export const updateEquipmentBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, website } = req.body;
    
    // Verificar se a marca existe
    const brand = await prisma.equipmentBrand.findUnique({
      where: { id }
    });
    
    if (!brand) {
      return res.status(404).json({ message: 'Marca não encontrada' });
    }
    
    // Verificar se o nome já existe (se ele foi alterado)
    if (name && name !== brand.name) {
      const nameExists = await prisma.equipmentBrand.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({ message: 'Já existe uma marca com este nome' });
      }
    }
    
    // Atualizar dados
    const updatedBrand = await prisma.equipmentBrand.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        website: website !== undefined ? website : undefined
      }
    });
    
    return res.json({
      message: 'Marca atualizada com sucesso',
      brand: updatedBrand
    });
  } catch (error) {
    console.error('Erro ao atualizar marca de equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove uma marca de equipamento
 */
export const deleteEquipmentBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se a marca existe
    const brand = await prisma.equipmentBrand.findUnique({
      where: { id }
    });
    
    if (!brand) {
      return res.status(404).json({ message: 'Marca não encontrada' });
    }
    
    // TODO: Verificar se há equipamentos utilizando esta marca
    
    // Remover marca
    await prisma.equipmentBrand.delete({
      where: { id }
    });
    
    return res.json({ message: 'Marca removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover marca de equipamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 