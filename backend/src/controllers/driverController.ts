import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os motoristas
 */
export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Busca filtrada
    const status = req.query.status as string;
    const where = status ? { status } : {};
    
    // Buscar motoristas com paginação
    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        orderBy: [
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.driver.count({ where })
    ]);
    
    return res.json({
      drivers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um motorista por ID
 */
export const getDriverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const driver = await prisma.driver.findUnique({
      where: { id }
    });
    
    if (!driver) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    
    return res.json(driver);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo motorista
 */
export const createDriver = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      document, 
      license_number, 
      license_category,
      license_expiry,
      phone,
      address,
      status,
      notes
    } = req.body;
    
    // Validação básica
    if (!name || !document || !license_number || !license_category || !license_expiry) {
      return res.status(400).json({ 
        message: 'Nome, documento, número da CNH, categoria da CNH e data de validade são obrigatórios' 
      });
    }
    
    // Verificar se já existe um motorista com este documento ou número de CNH
    const existingDriver = await prisma.driver.findFirst({
      where: {
        OR: [
          { document },
          { license_number }
        ]
      }
    });
    
    if (existingDriver) {
      return res.status(400).json({ 
        message: 'Já existe um motorista com este documento ou número de CNH' 
      });
    }
    
    // Criar motorista
    const driver = await prisma.driver.create({
      data: {
        name,
        document,
        license_number,
        license_category,
        license_expiry: new Date(license_expiry),
        phone,
        address,
        status: status || 'active',
        notes
      }
    });
    
    return res.status(201).json({
      message: 'Motorista criado com sucesso',
      driver
    });
  } catch (error) {
    console.error('Erro ao criar motorista:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um motorista
 */
export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      document, 
      license_number, 
      license_category,
      license_expiry,
      phone,
      address,
      status,
      notes 
    } = req.body;
    
    // Verificar se o motorista existe
    const driver = await prisma.driver.findUnique({
      where: { id }
    });
    
    if (!driver) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    
    // Verificar se o documento ou CNH já existem (se foram alterados)
    if ((document && document !== driver.document) || 
        (license_number && license_number !== driver.license_number)) {
      const driverExists = await prisma.driver.findFirst({
        where: {
          OR: [
            { document: document || '' },
            { license_number: license_number || '' }
          ],
          id: { not: id }
        }
      });
      
      if (driverExists) {
        return res.status(400).json({ 
          message: 'Já existe um motorista com este documento ou número de CNH' 
        });
      }
    }
    
    // Atualizar dados
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        name: name || undefined,
        document: document || undefined,
        license_number: license_number || undefined,
        license_category: license_category || undefined,
        license_expiry: license_expiry ? new Date(license_expiry) : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return res.json({
      message: 'Motorista atualizado com sucesso',
      driver: updatedDriver
    });
  } catch (error) {
    console.error('Erro ao atualizar motorista:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um motorista
 */
export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o motorista existe
    const driver = await prisma.driver.findUnique({
      where: { id }
    });
    
    if (!driver) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    
    // TODO: Verificar se há veículos associados a este motorista
    
    // Remover motorista
    await prisma.driver.delete({
      where: { id }
    });
    
    return res.json({ message: 'Motorista removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover motorista:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 