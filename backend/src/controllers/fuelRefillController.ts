import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os abastecimentos
 */
export const getAllFuelRefills = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const vehicleId = req.query.vehicleId as string;
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    
    // Construir o objeto where com base nos filtros
    const where: any = {};
    if (vehicleId) where.vehicle_id = vehicleId;
    if (fromDate && toDate) {
      where.date = {
        gte: new Date(fromDate),
        lte: new Date(toDate)
      };
    } else if (fromDate) {
      where.date = { gte: new Date(fromDate) };
    } else if (toDate) {
      where.date = { lte: new Date(toDate) };
    }
    
    // Buscar abastecimentos com paginação
    const [refills, total] = await Promise.all([
      prisma.fuelRefill.findMany({
        where,
        orderBy: [
          { date: 'desc' }
        ],
        include: {
          vehicle: {
            select: {
              id: true,
              plate: true,
              model: true,
              brand: true
            }
          }
        },
        skip,
        take: limit
      }),
      prisma.fuelRefill.count({ where })
    ]);
    
    return res.json({
      refills,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar abastecimentos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um abastecimento por ID
 */
export const getFuelRefillById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const refill = await prisma.fuelRefill.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            model: true,
            brand: true,
            fuel_type: true
          }
        }
      }
    });
    
    if (!refill) {
      return res.status(404).json({ message: 'Abastecimento não encontrado' });
    }
    
    return res.json(refill);
  } catch (error) {
    console.error('Erro ao buscar abastecimento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo abastecimento
 */
export const createFuelRefill = async (req: Request, res: Response) => {
  try {
    const { 
      vehicle_id, 
      date, 
      amount_liters, 
      price_per_liter, 
      total_price, 
      mileage, 
      fuel_type, 
      gas_station, 
      notes 
    } = req.body;
    
    // Validação básica
    if (!vehicle_id || !date || !amount_liters || !price_per_liter || !mileage) {
      return res.status(400).json({ 
        message: 'Veículo, data, quantidade de litros, preço por litro e quilometragem são obrigatórios' 
      });
    }
    
    // Verificar se o veículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicle_id }
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    // Calcular o valor total se não foi informado
    const calculatedTotalPrice = total_price || (amount_liters * price_per_liter);
    
    // Criar abastecimento
    const refill = await prisma.fuelRefill.create({
      data: {
        vehicle_id,
        date: new Date(date),
        amount_liters: Number(amount_liters),
        price_per_liter: Number(price_per_liter),
        total_price: Number(calculatedTotalPrice),
        mileage: Number(mileage),
        fuel_type: fuel_type || vehicle.fuel_type,
        gas_station,
        notes
      },
      include: {
        vehicle: {
          select: {
            plate: true,
            model: true
          }
        }
      }
    });
    
    // Atualizar a quilometragem do veículo se necessário
    if (vehicle.mileage < Number(mileage)) {
      await prisma.vehicle.update({
        where: { id: vehicle_id },
        data: { mileage: Number(mileage) }
      });
    }
    
    return res.status(201).json({
      message: 'Abastecimento registrado com sucesso',
      refill
    });
  } catch (error) {
    console.error('Erro ao registrar abastecimento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um abastecimento
 */
export const updateFuelRefill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      vehicle_id, 
      date, 
      amount_liters, 
      price_per_liter, 
      total_price, 
      mileage, 
      fuel_type, 
      gas_station, 
      notes 
    } = req.body;
    
    // Verificar se o abastecimento existe
    const refill = await prisma.fuelRefill.findUnique({
      where: { id }
    });
    
    if (!refill) {
      return res.status(404).json({ message: 'Abastecimento não encontrado' });
    }
    
    // Verificar se o veículo existe (se foi alterado)
    if (vehicle_id && vehicle_id !== refill.vehicle_id) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicle_id }
      });
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Veículo não encontrado' });
      }
    }
    
    // Calcular o valor total se preço ou quantidade foram alterados
    let newTotalPrice = total_price;
    if (amount_liters && price_per_liter) {
      newTotalPrice = Number(amount_liters) * Number(price_per_liter);
    } else if (amount_liters && !price_per_liter && !total_price) {
      newTotalPrice = Number(amount_liters) * refill.price_per_liter;
    } else if (!amount_liters && price_per_liter && !total_price) {
      newTotalPrice = refill.amount_liters * Number(price_per_liter);
    }
    
    // Atualizar dados
    const updatedRefill = await prisma.fuelRefill.update({
      where: { id },
      data: {
        vehicle_id: vehicle_id || undefined,
        date: date ? new Date(date) : undefined,
        amount_liters: amount_liters ? Number(amount_liters) : undefined,
        price_per_liter: price_per_liter ? Number(price_per_liter) : undefined,
        total_price: newTotalPrice !== undefined ? Number(newTotalPrice) : undefined,
        mileage: mileage ? Number(mileage) : undefined,
        fuel_type: fuel_type || undefined,
        gas_station: gas_station !== undefined ? gas_station : undefined,
        notes: notes !== undefined ? notes : undefined
      },
      include: {
        vehicle: {
          select: {
            plate: true,
            model: true,
            mileage: true
          }
        }
      }
    });
    
    // Atualizar a quilometragem do veículo se necessário
    if (mileage && updatedRefill.vehicle && updatedRefill.vehicle.mileage < Number(mileage)) {
      await prisma.vehicle.update({
        where: { id: updatedRefill.vehicle_id },
        data: { mileage: Number(mileage) }
      });
    }
    
    return res.json({
      message: 'Abastecimento atualizado com sucesso',
      refill: updatedRefill
    });
  } catch (error) {
    console.error('Erro ao atualizar abastecimento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um abastecimento
 */
export const deleteFuelRefill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o abastecimento existe
    const refill = await prisma.fuelRefill.findUnique({
      where: { id }
    });
    
    if (!refill) {
      return res.status(404).json({ message: 'Abastecimento não encontrado' });
    }
    
    // Remover abastecimento
    await prisma.fuelRefill.delete({
      where: { id }
    });
    
    return res.json({ message: 'Abastecimento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover abastecimento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 