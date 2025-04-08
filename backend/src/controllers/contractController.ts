import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os contratos
 */
export const getAllContracts = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    
    // Construir o objeto where com base nos filtros
    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    
    // Buscar contratos com paginação
    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: [
          { startDate: 'desc' }
        ],
        include: {
          customer: {
            select: {
              id: true,
              full_name: true,
              document_number: true,
              email: true,
              phone: true
            }
          }
        },
        skip,
        take: limit
      }),
      prisma.contract.count({ where })
    ]);
    
    return res.json({
      contracts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um contrato por ID
 */
export const getContractById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            full_name: true,
            document_number: true,
            email: true,
            phone: true,
            address: true,
            planId: true,
            plan: true
          }
        }
      }
    });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrato não encontrado' });
    }
    
    return res.json(contract);
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo contrato
 */
export const createContract = async (req: Request, res: Response) => {
  try {
    const { 
      customerId, 
      number, 
      startDate, 
      endDate, 
      status, 
      document_url, 
      signature_date,
      terms
    } = req.body;
    
    // Validação básica
    if (!customerId || !number || !startDate || !terms) {
      return res.status(400).json({ 
        message: 'Cliente, número do contrato, data de início e termos são obrigatórios' 
      });
    }
    
    // Verificar se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Verificar se já existe um contrato com este número
    const existingContract = await prisma.contract.findFirst({
      where: { number }
    });
    
    if (existingContract) {
      return res.status(400).json({ 
        message: 'Já existe um contrato com este número' 
      });
    }
    
    // Criar contrato
    const contract = await prisma.contract.create({
      data: {
        customerId,
        number,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'ACTIVE',
        document_url,
        signature_date: signature_date ? new Date(signature_date) : null,
        terms
      }
    });
    
    return res.status(201).json({
      message: 'Contrato criado com sucesso',
      contract
    });
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um contrato
 */
export const updateContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      customerId, 
      number, 
      startDate, 
      endDate, 
      status, 
      document_url, 
      signature_date,
      terms
    } = req.body;
    
    // Verificar se o contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id }
    });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrato não encontrado' });
    }
    
    // Verificar se o cliente existe (se foi alterado)
    if (customerId && customerId !== contract.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });
      
      if (!customer) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }
    }
    
    // Verificar se o número do contrato já existe (se foi alterado)
    if (number && number !== contract.number) {
      const numberExists = await prisma.contract.findFirst({
        where: {
          number,
          id: { not: id }
        }
      });
      
      if (numberExists) {
        return res.status(400).json({ message: 'Já existe um contrato com este número' });
      }
    }
    
    // Atualizar dados
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        customerId: customerId || undefined,
        number: number || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        status: status || undefined,
        document_url: document_url !== undefined ? document_url : undefined,
        signature_date: signature_date !== undefined ? (signature_date ? new Date(signature_date) : null) : undefined,
        terms: terms || undefined
      }
    });
    
    return res.json({
      message: 'Contrato atualizado com sucesso',
      contract: updatedContract
    });
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove um contrato
 */
export const deleteContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id }
    });
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrato não encontrado' });
    }
    
    // Verificar se o contrato pode ser excluído (status)
    if (contract.status === 'ACTIVE') {
      return res.status(400).json({ 
        message: 'Não é possível excluir um contrato ativo. Cancele o contrato primeiro.' 
      });
    }
    
    // Remover contrato
    await prisma.contract.delete({
      where: { id }
    });
    
    return res.json({ message: 'Contrato removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover contrato:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 