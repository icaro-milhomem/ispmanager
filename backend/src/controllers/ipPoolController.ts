import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os pools de IP
 */
export const getAllIPPools = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Buscar pools de IP com paginação
    const [pools, total] = await Promise.all([
      prisma.iPPool.findMany({
        orderBy: [
          { name: 'asc' }
        ],
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              ip_assignments: true
            }
          }
        }
      }),
      prisma.iPPool.count()
    ]);
    
    return res.json({
      pools,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pools de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um pool de IP por ID
 */
export const getIPPoolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const pool = await prisma.iPPool.findUnique({
      where: { id },
      include: {
        ip_assignments: true
      }
    });
    
    if (!pool) {
      return res.status(404).json({ message: 'Pool de IP não encontrado' });
    }
    
    return res.json(pool);
  } catch (error) {
    console.error('Erro ao buscar pool de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo pool de IP
 */
export const createIPPool = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      subnet, 
      mask, 
      gateway, 
      dns_primary, 
      dns_secondary 
    } = req.body;
    
    // Validação básica
    if (!name || !subnet || !mask || !gateway) {
      return res.status(400).json({ 
        message: 'Nome, rede, máscara e gateway são obrigatórios' 
      });
    }
    
    // Verificar se já existe um pool com este nome
    const existingPool = await prisma.iPPool.findFirst({
      where: { name }
    });
    
    if (existingPool) {
      return res.status(400).json({ 
        message: 'Já existe um pool com este nome' 
      });
    }
    
    // Criar pool de IP
    const pool = await prisma.iPPool.create({
      data: {
        name,
        subnet,
        mask,
        gateway,
        dns_primary,
        dns_secondary
      }
    });
    
    return res.status(201).json({
      message: 'Pool de IP criado com sucesso',
      pool
    });
  } catch (error) {
    console.error('Erro ao criar pool de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um pool de IP
 */
export const updateIPPool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      subnet, 
      mask, 
      gateway, 
      dns_primary, 
      dns_secondary 
    } = req.body;
    
    // Verificar se o pool existe
    const pool = await prisma.iPPool.findUnique({
      where: { id }
    });
    
    if (!pool) {
      return res.status(404).json({ message: 'Pool de IP não encontrado' });
    }
    
    // Verificar se há outro pool com o mesmo nome (exceto este)
    if (name && name !== pool.name) {
      const nameExists = await prisma.iPPool.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({ message: 'Já existe um pool com este nome' });
      }
    }
    
    // Atualizar dados
    const updatedPool = await prisma.iPPool.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        subnet: subnet !== undefined ? subnet : undefined,
        mask: mask !== undefined ? mask : undefined,
        gateway: gateway !== undefined ? gateway : undefined,
        dns_primary: dns_primary !== undefined ? dns_primary : undefined,
        dns_secondary: dns_secondary !== undefined ? dns_secondary : undefined
      }
    });
    
    return res.json({
      message: 'Pool de IP atualizado com sucesso',
      pool: updatedPool
    });
  } catch (error) {
    console.error('Erro ao atualizar pool de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um pool de IP
 */
export const deleteIPPool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o pool existe
    const pool = await prisma.iPPool.findUnique({
      where: { id },
      include: {
        ip_assignments: true
      }
    });
    
    if (!pool) {
      return res.status(404).json({ message: 'Pool de IP não encontrado' });
    }
    
    // Impedir exclusão se tiver atribuições de IP
    if (pool.ip_assignments.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir um pool que possui IPs atribuídos' 
      });
    }
    
    // Remover pool
    await prisma.iPPool.delete({
      where: { id }
    });
    
    return res.json({ message: 'Pool de IP removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover pool de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Adiciona uma atribuição de IP
 */
export const addIPAssignment = async (req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    const { 
      ip, 
      status, 
      customer_name, 
      customer_id, 
      assignment_type, 
      mac_address 
    } = req.body;
    
    // Validação básica
    if (!ip) {
      return res.status(400).json({ message: 'IP é obrigatório' });
    }
    
    // Verificar se o pool existe
    const pool = await prisma.iPPool.findUnique({
      where: { id: poolId }
    });
    
    if (!pool) {
      return res.status(404).json({ message: 'Pool de IP não encontrado' });
    }
    
    // Verificar se o IP já está atribuído
    const existingAssignment = await prisma.iPAssignment.findFirst({
      where: {
        ip_pool_id: poolId,
        ip
      }
    });
    
    if (existingAssignment) {
      return res.status(400).json({ message: 'Este IP já está atribuído neste pool' });
    }
    
    // Criar atribuição
    const assignment = await prisma.iPAssignment.create({
      data: {
        ip_pool_id: poolId,
        ip,
        status: status || 'available',
        customer_name,
        customer_id,
        assignment_type,
        mac_address,
        last_seen: assignment_type === 'active' ? new Date() : null
      }
    });
    
    return res.status(201).json({
      message: 'IP atribuído com sucesso',
      assignment
    });
  } catch (error) {
    console.error('Erro ao atribuir IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza uma atribuição de IP
 */
export const updateIPAssignment = async (req: Request, res: Response) => {
  try {
    const { poolId, assignmentId } = req.params;
    const { 
      status, 
      customer_name, 
      customer_id, 
      assignment_type, 
      mac_address,
      last_seen
    } = req.body;
    
    // Verificar se a atribuição existe
    const assignment = await prisma.iPAssignment.findFirst({
      where: { 
        id: assignmentId,
        ip_pool_id: poolId
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Atribuição de IP não encontrada' });
    }
    
    // Atualizar atribuição
    const updatedAssignment = await prisma.iPAssignment.update({
      where: { id: assignmentId },
      data: {
        status: status !== undefined ? status : undefined,
        customer_name: customer_name !== undefined ? customer_name : undefined,
        customer_id: customer_id !== undefined ? customer_id : undefined,
        assignment_type: assignment_type !== undefined ? assignment_type : undefined,
        mac_address: mac_address !== undefined ? mac_address : undefined,
        last_seen: last_seen !== undefined ? new Date(last_seen) : undefined
      }
    });
    
    return res.json({
      message: 'Atribuição de IP atualizada com sucesso',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Erro ao atualizar atribuição de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove uma atribuição de IP
 */
export const deleteIPAssignment = async (req: Request, res: Response) => {
  try {
    const { poolId, assignmentId } = req.params;
    
    // Verificar se a atribuição existe
    const assignment = await prisma.iPAssignment.findFirst({
      where: { 
        id: assignmentId,
        ip_pool_id: poolId
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Atribuição de IP não encontrada' });
    }
    
    // Remover atribuição
    await prisma.iPAssignment.delete({
      where: { id: assignmentId }
    });
    
    return res.json({ message: 'Atribuição de IP removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover atribuição de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Lista todas as atribuições de IP de um pool
 */
export const getIPAssignments = async (req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    const { status, customer_id } = req.query;
    
    // Verificar se o pool existe
    const pool = await prisma.iPPool.findUnique({
      where: { id: poolId }
    });
    
    if (!pool) {
      return res.status(404).json({ message: 'Pool de IP não encontrado' });
    }
    
    // Construir o filtro de consulta
    const where: any = {
      ip_pool_id: poolId
    };
    
    if (status) {
      where.status = status as string;
    }
    
    if (customer_id) {
      where.customer_id = customer_id as string;
    }
    
    // Buscar as atribuições
    const assignments = await prisma.iPAssignment.findMany({
      where,
      orderBy: {
        ip: 'asc'
      }
    });
    
    return res.json(assignments);
  } catch (error) {
    console.error('Erro ao listar atribuições de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Lista todas as atribuições de IP do sistema
 */
export const getAllIPAssignments = async (req: Request, res: Response) => {
  try {
    const { status, customer_id, ip_pool_id } = req.query;
    
    // Construir o filtro de consulta
    const where: any = {};
    
    if (status) {
      where.status = status as string;
    }
    
    if (customer_id) {
      where.customer_id = customer_id as string;
    }
    
    if (ip_pool_id) {
      where.ip_pool_id = ip_pool_id as string;
    }
    
    // Buscar as atribuições
    const assignments = await prisma.iPAssignment.findMany({
      where,
      include: {
        ip_pool: true
      },
      orderBy: {
        ip: 'asc'
      }
    });
    
    return res.json(assignments);
  } catch (error) {
    console.error('Erro ao listar todas as atribuições de IP:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 