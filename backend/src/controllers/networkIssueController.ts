import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os problemas de rede
 */
export const getAllNetworkIssues = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construir filtro
    let where = {};
    
    if (status) {
      where = { ...where, status };
    }
    
    if (priority) {
      where = { ...where, priority };
    }
    
    // Buscar problemas de rede com filtro e paginação
    const [issues, total] = await Promise.all([
      prisma.networkIssue.findMany({
        where,
        orderBy: [
          { created_date: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.networkIssue.count({ where })
    ]);
    
    return res.json({
      issues,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar problemas de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um problema de rede por ID
 */
export const getNetworkIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const issue = await prisma.networkIssue.findUnique({
      where: { id }
    });
    
    if (!issue) {
      return res.status(404).json({ message: 'Problema de rede não encontrado' });
    }
    
    return res.json(issue);
  } catch (error) {
    console.error('Erro ao buscar problema de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo problema de rede
 */
export const createNetworkIssue = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      type, 
      status, 
      priority, 
      affected_customers 
    } = req.body;
    
    // Validação básica
    if (!title || !description || !type) {
      return res.status(400).json({ 
        message: 'Título, descrição e tipo são obrigatórios' 
      });
    }
    
    // Criar problema de rede
    const issue = await prisma.networkIssue.create({
      data: {
        title,
        description,
        type,
        status: status || 'open',
        priority: priority || 'medium',
        affected_customers: affected_customers || [],
        created_date: new Date()
      }
    });
    
    return res.status(201).json({
      message: 'Problema de rede criado com sucesso',
      issue
    });
  } catch (error) {
    console.error('Erro ao criar problema de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um problema de rede
 */
export const updateNetworkIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      type, 
      status, 
      priority, 
      affected_customers,
      resolution,
      resolved_date
    } = req.body;
    
    // Verificar se o problema existe
    const issue = await prisma.networkIssue.findUnique({
      where: { id }
    });
    
    if (!issue) {
      return res.status(404).json({ message: 'Problema de rede não encontrado' });
    }
    
    // Atualizar dados
    const updatedIssue = await prisma.networkIssue.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        type: type !== undefined ? type : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        affected_customers: affected_customers !== undefined ? affected_customers : undefined,
        resolution: resolution !== undefined ? resolution : undefined,
        resolved_date: status === 'resolved' && !issue.resolved_date ? new Date() : 
          resolved_date !== undefined ? resolved_date : undefined
      }
    });
    
    return res.json({
      message: 'Problema de rede atualizado com sucesso',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Erro ao atualizar problema de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um problema de rede
 */
export const deleteNetworkIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o problema existe
    const issue = await prisma.networkIssue.findUnique({
      where: { id }
    });
    
    if (!issue) {
      return res.status(404).json({ message: 'Problema de rede não encontrado' });
    }
    
    // Remover problema
    await prisma.networkIssue.delete({
      where: { id }
    });
    
    return res.json({ message: 'Problema de rede removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover problema de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 