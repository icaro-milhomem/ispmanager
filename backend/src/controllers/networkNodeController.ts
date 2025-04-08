import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os nós de rede
 */
export const getAllNetworkNodes = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const status = req.query.status as string;
    const type = req.query.type as string;
    const search = req.query.search as string;
    
    // Construir o objeto where com base nos filtros
    const where: any = {};
    if (status) {
      // Converter status para maiúsculo se for 'active'
      where.status = status === 'active' ? 'ACTIVE' : status;
    }
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ip_address: { contains: search, mode: 'insensitive' } },
        { mac_address: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Buscar nós de rede com paginação
    const [nodes, total] = await Promise.all([
      prisma.networkNode.findMany({
        where,
        orderBy: [
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.networkNode.count({ where })
    ]);
    
    // Verificar se o dashboard está solicitando sem paginação
    if (req.query.dashboard === 'true') {
      return res.json(nodes);
    }
    
    return res.json({
      nodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar nós de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um nó de rede por ID
 */
export const getNetworkNodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const node = await prisma.networkNode.findUnique({
      where: { id }
    });
    
    if (!node) {
      return res.status(404).json({ message: 'Nó de rede não encontrado' });
    }
    
    return res.json(node);
  } catch (error) {
    console.error('Erro ao buscar nó de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo nó de rede
 */
export const createNetworkNode = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      type, 
      ip_address, 
      mac_address, 
      location, 
      status, 
      notes 
    } = req.body;
    
    // Validação básica
    if (!name || !type || !ip_address) {
      return res.status(400).json({ 
        message: 'Nome, tipo e endereço IP são obrigatórios' 
      });
    }
    
    // Verificar se já existe um nó com este IP
    const existingNode = await prisma.networkNode.findFirst({
      where: { ip_address }
    });
    
    if (existingNode) {
      return res.status(400).json({ 
        message: 'Já existe um nó de rede com este endereço IP' 
      });
    }
    
    // Criar nó de rede
    const node = await prisma.networkNode.create({
      data: {
        name,
        type,
        ip_address,
        mac_address,
        location,
        status: status || 'ACTIVE',
        notes
      }
    });
    
    return res.status(201).json({
      message: 'Nó de rede criado com sucesso',
      node
    });
  } catch (error) {
    console.error('Erro ao criar nó de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um nó de rede
 */
export const updateNetworkNode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      type, 
      ip_address, 
      mac_address, 
      location, 
      status, 
      notes 
    } = req.body;
    
    // Verificar se o nó existe
    const node = await prisma.networkNode.findUnique({
      where: { id }
    });
    
    if (!node) {
      return res.status(404).json({ message: 'Nó de rede não encontrado' });
    }
    
    // Verificar se o IP já existe (se foi alterado)
    if (ip_address && ip_address !== node.ip_address) {
      const ipExists = await prisma.networkNode.findFirst({
        where: {
          ip_address,
          id: { not: id }
        }
      });
      
      if (ipExists) {
        return res.status(400).json({ message: 'Já existe um nó de rede com este endereço IP' });
      }
    }
    
    // Atualizar dados
    const updatedNode = await prisma.networkNode.update({
      where: { id },
      data: {
        name: name || undefined,
        type: type || undefined,
        ip_address: ip_address || undefined,
        mac_address: mac_address !== undefined ? mac_address : undefined,
        location: location !== undefined ? location : undefined,
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return res.json({
      message: 'Nó de rede atualizado com sucesso',
      node: updatedNode
    });
  } catch (error) {
    console.error('Erro ao atualizar nó de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um nó de rede
 */
export const deleteNetworkNode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o nó existe
    const node = await prisma.networkNode.findUnique({
      where: { id }
    });
    
    if (!node) {
      return res.status(404).json({ message: 'Nó de rede não encontrado' });
    }
    
    // Remover nó de rede
    await prisma.networkNode.delete({
      where: { id }
    });
    
    return res.json({ message: 'Nó de rede removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover nó de rede:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 