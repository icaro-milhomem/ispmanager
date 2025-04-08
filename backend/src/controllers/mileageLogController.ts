import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os registros de quilometragem com paginação e filtros
 */
export const getAllMileageLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, vehicleId, startDate, endDate } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Construir condições de filtro
    const where: any = {};
    
    if (vehicleId) {
      where.vehicle_id = String(vehicleId);
    }
    
    // Filtro por período
    if (startDate && endDate) {
      where.date = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate))
      };
    } else if (startDate) {
      where.date = { gte: new Date(String(startDate)) };
    } else if (endDate) {
      where.date = { lte: new Date(String(endDate)) };
    }

    // Realizar consulta com filtros e paginação
    const [mileageLogs, total] = await Promise.all([
      prisma.mileageLog.findMany({
        where,
        include: { vehicle: true },
        skip,
        take: limitNumber,
        orderBy: { date: 'desc' }
      }),
      prisma.mileageLog.count({ where })
    ]);

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      data: mileageLogs,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar registros de quilometragem:', error);
    return res.status(500).json({
      message: 'Erro ao buscar registros de quilometragem',
      error: error.message
    });
  }
};

/**
 * Obtém um registro de quilometragem por ID
 */
export const getMileageLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const mileageLog = await prisma.mileageLog.findUnique({
      where: { id },
      include: { vehicle: true }
    });

    if (!mileageLog) {
      return res.status(404).json({ message: 'Registro de quilometragem não encontrado' });
    }

    return res.status(200).json(mileageLog);
  } catch (error: any) {
    console.error('Erro ao buscar registro de quilometragem:', error);
    return res.status(500).json({
      message: 'Erro ao buscar registro de quilometragem',
      error: error.message
    });
  }
};

/**
 * Cria um novo registro de quilometragem
 */
export const createMileageLog = async (req: Request, res: Response) => {
  try {
    const {
      vehicle_id,
      date,
      initial_mileage,
      final_mileage,
      purpose,
      notes
    } = req.body;

    // Validar campos obrigatórios
    if (!vehicle_id || !date || initial_mileage === undefined || final_mileage === undefined || !purpose) {
      return res.status(400).json({
        message: 'Campos obrigatórios: vehicle_id, date, initial_mileage, final_mileage, purpose'
      });
    }

    // Converter valores para números
    const initialMileage = Number(initial_mileage);
    const finalMileage = Number(final_mileage);

    // Validar valores de quilometragem
    if (isNaN(initialMileage) || isNaN(finalMileage)) {
      return res.status(400).json({ message: 'Valores de quilometragem inválidos' });
    }

    if (initialMileage > finalMileage) {
      return res.status(400).json({ 
        message: 'A quilometragem final deve ser maior ou igual à quilometragem inicial' 
      });
    }

    // Calcular a distância percorrida
    const distance = finalMileage - initialMileage;

    // Verificar se o veículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicle_id }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }

    // Criar o registro de quilometragem
    const mileageLog = await prisma.mileageLog.create({
      data: {
        vehicle_id,
        date: new Date(date),
        initial_mileage: initialMileage,
        final_mileage: finalMileage,
        distance,
        purpose,
        notes
      }
    });

    // Atualizar a quilometragem do veículo se necessário
    if (finalMileage > vehicle.mileage) {
      await prisma.vehicle.update({
        where: { id: vehicle_id },
        data: { mileage: finalMileage }
      });
    }

    return res.status(201).json({
      message: 'Registro de quilometragem criado com sucesso',
      data: mileageLog
    });
  } catch (error: any) {
    console.error('Erro ao criar registro de quilometragem:', error);
    return res.status(500).json({
      message: 'Erro ao criar registro de quilometragem',
      error: error.message
    });
  }
};

/**
 * Atualiza um registro de quilometragem
 */
export const updateMileageLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      vehicle_id,
      date,
      initial_mileage,
      final_mileage,
      purpose,
      notes
    } = req.body;

    // Verificar se o registro existe
    const existingLog = await prisma.mileageLog.findUnique({
      where: { id }
    });

    if (!existingLog) {
      return res.status(404).json({ message: 'Registro de quilometragem não encontrado' });
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (vehicle_id) updateData.vehicle_id = vehicle_id;
    if (date) updateData.date = new Date(date);
    if (purpose) updateData.purpose = purpose;
    if (notes !== undefined) updateData.notes = notes;

    // Validar e processar dados de quilometragem
    if (initial_mileage !== undefined || final_mileage !== undefined) {
      const initialMileage = initial_mileage !== undefined ? Number(initial_mileage) : existingLog.initial_mileage;
      const finalMileage = final_mileage !== undefined ? Number(final_mileage) : existingLog.final_mileage;

      // Validar valores
      if (isNaN(initialMileage) || isNaN(finalMileage)) {
        return res.status(400).json({ message: 'Valores de quilometragem inválidos' });
      }

      if (initialMileage > finalMileage) {
        return res.status(400).json({ 
          message: 'A quilometragem final deve ser maior ou igual à quilometragem inicial' 
        });
      }

      // Atualizar campos de quilometragem
      updateData.initial_mileage = initialMileage;
      updateData.final_mileage = finalMileage;
      updateData.distance = finalMileage - initialMileage;

      // Se o veículo foi alterado ou a quilometragem final foi aumentada, atualize o veículo
      if (vehicle_id || (finalMileage > existingLog.final_mileage)) {
        const vehicleId = vehicle_id || existingLog.vehicle_id;
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId }
        });

        if (vehicle && finalMileage > vehicle.mileage) {
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { mileage: finalMileage }
          });
        }
      }
    }

    // Atualizar o registro
    const updatedLog = await prisma.mileageLog.update({
      where: { id },
      data: updateData,
      include: { vehicle: true }
    });

    // Verificar se a quilometragem final é maior que a do veículo e atualizar
    if (updatedLog.vehicle && updatedLog.final_mileage > updatedLog.vehicle.mileage) {
      await prisma.vehicle.update({
        where: { id: updatedLog.vehicle_id },
        data: { mileage: updatedLog.final_mileage }
      });
    }

    return res.status(200).json({
      message: 'Registro de quilometragem atualizado com sucesso',
      data: updatedLog
    });
  } catch (error: any) {
    console.error('Erro ao atualizar registro de quilometragem:', error);
    return res.status(500).json({
      message: 'Erro ao atualizar registro de quilometragem',
      error: error.message
    });
  }
};

/**
 * Exclui um registro de quilometragem
 */
export const deleteMileageLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o registro existe
    const existingLog = await prisma.mileageLog.findUnique({
      where: { id }
    });

    if (!existingLog) {
      return res.status(404).json({ message: 'Registro de quilometragem não encontrado' });
    }

    // Excluir o registro
    await prisma.mileageLog.delete({
      where: { id }
    });

    return res.status(200).json({
      message: 'Registro de quilometragem excluído com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao excluir registro de quilometragem:', error);
    return res.status(500).json({
      message: 'Erro ao excluir registro de quilometragem',
      error: error.message
    });
  }
}; 