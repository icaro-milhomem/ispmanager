import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { PaymentGateway } from '@prisma/client';

/**
 * Obtém todos os gateways de pagamento
 */
export const getAllPaymentGateways = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtro pelo status ativo
    const is_active = req.query.active === 'true' ? true : 
                     req.query.active === 'false' ? false : 
                     undefined;

    const where = is_active !== undefined ? { is_active } : {};

    // Buscar gateways com paginação
    const [gateways, total] = await Promise.all([
      prisma.paymentGateway.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.paymentGateway.count({ where })
    ]);

    // Mascarar informações sensíveis
    const maskedGateways = gateways.map((gateway: PaymentGateway) => ({
      ...gateway,
      api_key: gateway.api_key ? '********' : null,
      api_secret: gateway.api_secret ? '********' : null
    }));

    return res.json({
      data: maskedGateways,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar gateways de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um gateway de pagamento por ID
 */
export const getPaymentGatewayById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id }
    });
    
    if (!gateway) {
      return res.status(404).json({ message: 'Gateway de pagamento não encontrado' });
    }
    
    // Mascarar informações sensíveis
    const maskedGateway = {
      ...gateway,
      api_key: gateway.api_key ? '********' : null,
      api_secret: gateway.api_secret ? '********' : null
    };
    
    return res.json(maskedGateway);
  } catch (error) {
    console.error('Erro ao buscar gateway de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo gateway de pagamento
 */
export const createPaymentGateway = async (req: Request, res: Response) => {
  try {
    const { name, provider, api_key, api_secret, is_active, sandbox_mode, webhook_url, return_url, supported_methods, notes } = req.body;
    
    // Validar campos obrigatórios
    if (!name || !provider) {
      return res.status(400).json({ 
        message: 'Nome e provedor são campos obrigatórios' 
      });
    }
    
    // Verificar se já existe um gateway com o mesmo nome
    const existingGateway = await prisma.paymentGateway.findFirst({
      where: { name }
    });
    
    if (existingGateway) {
      return res.status(400).json({ 
        message: 'Já existe um gateway de pagamento com este nome' 
      });
    }
    
    // Criar o gateway
    const gateway = await prisma.paymentGateway.create({
      data: {
        name,
        provider,
        api_key,
        api_secret,
        is_active: is_active !== undefined ? is_active : true,
        sandbox_mode: sandbox_mode !== undefined ? sandbox_mode : false,
        webhook_url,
        return_url,
        supported_methods,
        notes
      }
    });
    
    return res.status(201).json({ 
      message: 'Gateway de pagamento criado com sucesso',
      id: gateway.id
    });
  } catch (error) {
    console.error('Erro ao criar gateway de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um gateway de pagamento
 */
export const updatePaymentGateway = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, provider, api_key, api_secret, is_active, sandbox_mode, webhook_url, return_url, supported_methods, notes } = req.body;
    
    // Verificar se o gateway existe
    const existingGateway = await prisma.paymentGateway.findUnique({
      where: { id }
    });
    
    if (!existingGateway) {
      return res.status(404).json({ message: 'Gateway de pagamento não encontrado' });
    }
    
    // Verificar se existe outro gateway com o mesmo nome (excluindo o atual)
    if (name && name !== existingGateway.name) {
      const duplicateGateway = await prisma.paymentGateway.findFirst({
        where: { 
          name,
          id: { not: id }
        }
      });
      
      if (duplicateGateway) {
        return res.status(400).json({ 
          message: 'Já existe outro gateway de pagamento com este nome' 
        });
      }
    }
    
    // Atualizar o gateway
    const gateway = await prisma.paymentGateway.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        provider: provider !== undefined ? provider : undefined,
        api_key: api_key !== undefined ? api_key : undefined,
        api_secret: api_secret !== undefined ? api_secret : undefined,
        is_active: is_active !== undefined ? is_active : undefined,
        sandbox_mode: sandbox_mode !== undefined ? sandbox_mode : undefined,
        webhook_url: webhook_url !== undefined ? webhook_url : undefined,
        return_url: return_url !== undefined ? return_url : undefined,
        supported_methods: supported_methods !== undefined ? supported_methods : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return res.json({ 
      message: 'Gateway de pagamento atualizado com sucesso',
      id: gateway.id 
    });
  } catch (error) {
    console.error('Erro ao atualizar gateway de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um gateway de pagamento
 */
export const deletePaymentGateway = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o gateway existe
    const existingGateway = await prisma.paymentGateway.findUnique({
      where: { id }
    });
    
    if (!existingGateway) {
      return res.status(404).json({ message: 'Gateway de pagamento não encontrado' });
    }
    
    // Deletar o gateway
    await prisma.paymentGateway.delete({
      where: { id }
    });
    
    return res.json({ message: 'Gateway de pagamento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar gateway de pagamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 