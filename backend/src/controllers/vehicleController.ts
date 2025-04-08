import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os veículos
 */
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Busca filtrada
    const status = req.query.status as string;
    const where = status ? { status } : {};
    
    // Buscar veículos com paginação
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { plate: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.vehicle.count({ where })
    ]);
    
    return res.json({
      vehicles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um veículo por ID
 */
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    return res.json(vehicle);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo veículo
 */
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { 
      plate, 
      model, 
      brand, 
      year, 
      type, 
      status, 
      mileage, 
      fuel_type,
      driver_id,
      notes
    } = req.body;
    
    // Validação básica
    if (!plate || !model || !brand || !year || !fuel_type) {
      return res.status(400).json({ 
        message: 'Placa, modelo, marca, ano e tipo de combustível são obrigatórios' 
      });
    }
    
    // Verificar se já existe um veículo com esta placa
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { plate }
    });
    
    if (existingVehicle) {
      return res.status(400).json({ 
        message: 'Já existe um veículo com esta placa' 
      });
    }
    
    // Criar veículo
    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        model,
        brand,
        year: Number(year),
        type: type || 'car',
        status: status || 'active',
        mileage: mileage ? Number(mileage) : 0,
        fuel_type,
        driver_id,
        notes
      }
    });
    
    return res.status(201).json({
      message: 'Veículo criado com sucesso',
      vehicle
    });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um veículo
 */
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      plate, 
      model, 
      brand, 
      year, 
      type, 
      status, 
      mileage, 
      fuel_type,
      driver_id,
      notes 
    } = req.body;
    
    // Verificar se o veículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    // Verificar se a placa já existe (se ela foi alterada)
    if (plate && plate !== vehicle.plate) {
      const plateExists = await prisma.vehicle.findFirst({
        where: {
          plate,
          id: { not: id }
        }
      });
      
      if (plateExists) {
        return res.status(400).json({ message: 'Já existe um veículo com esta placa' });
      }
    }
    
    // Atualizar dados
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plate: plate || undefined,
        model: model || undefined,
        brand: brand || undefined,
        year: year ? Number(year) : undefined,
        type: type || undefined,
        status: status || undefined,
        mileage: mileage ? Number(mileage) : undefined,
        fuel_type: fuel_type || undefined,
        driver_id: driver_id || undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return res.json({
      message: 'Veículo atualizado com sucesso',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um veículo
 */
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o veículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    // TODO: Verificar se há registros dependentes (abastecimentos, etc.)
    
    // Remover veículo
    await prisma.vehicle.delete({
      where: { id }
    });
    
    return res.json({ message: 'Veículo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover veículo:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 