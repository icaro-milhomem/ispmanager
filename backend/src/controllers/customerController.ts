import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os clientes
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    // Construir filtro de busca se houver query
    const where = query
      ? {
          OR: [
            { full_name: { contains: String(query) } },
            { document_number: { contains: String(query) } },
            { email: { contains: String(query) } },
            { phone: { contains: String(query) } },
            { contract_number: { contains: String(query) } }
          ]
        }
      : {};

    // Verificar se o dashboard está solicitando sem paginação
    if (req.query.dashboard === 'true') {
      const customers = await prisma.customer.findMany({
        where,
        orderBy: { full_name: 'asc' },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              download: true,
              upload: true
            }
          }
        }
      });
      return res.json(customers);
    }

    // Busca paginada de clientes
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Busca os clientes
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { full_name: 'asc' },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              download: true,
              upload: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    return res.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um cliente específico
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        plan: true
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    return res.json(customer);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo cliente
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      document_type,
      document_number,
      email,
      phone,
      whatsapp,
      address,
      address_number,
      address_complement,
      neighborhood,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      installation_date,
      pppoe_username,
      pppoe_password,
      ip_address,
      download_limit,
      upload_limit,
      due_day,
      payment_method,
      planId,
      contract_number
    } = req.body;

    console.log('Criando cliente com os dados:', { 
      full_name, 
      planId, 
      installation_date, 
      contract_number 
    });

    // Validações básicas
    if (!full_name || !document_number || !email || !phone || !address) {
      return res.status(400).json({
        message: 'Nome completo, documento, e-mail, telefone e endereço são obrigatórios'
      });
    }

    // Verifica se já existe um cliente com este documento ou email
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { document_number },
          { email }
        ]
      }
    });

    if (existingCustomer) {
      return res.status(400).json({
        message: 'Já existe um cliente com este documento ou e-mail'
      });
    }

    // Verifica se o plano existe, caso tenha sido informado
    if (planId) {
      console.log('Verificando se existe o plano com ID:', planId);
      const planExists = await prisma.plan.findUnique({
        where: { id: planId }
      });

      console.log('Plano encontrado?', !!planExists);
      if (!planExists) {
        return res.status(400).json({ message: 'Plano não encontrado' });
      }
    }

    // Cria o cliente
    const customer = await prisma.customer.create({
      data: {
        full_name,
        document_type: document_type ? document_type.toUpperCase() : 'CPF',
        document_number,
        email,
        phone,
        whatsapp,
        status: 'PENDING',
        address,
        address_number,
        address_complement,
        neighborhood,
        city,
        state,
        zip_code,
        latitude,
        longitude,
        installation_date: installation_date ? new Date(installation_date) : null,
        pppoe_username,
        pppoe_password,
        ip_address,
        download_limit,
        upload_limit,
        due_day: due_day || 10,
        payment_method: payment_method ? payment_method.toUpperCase() : 'BANK_SLIP',
        planId,
        contract_number
      },
      include: {
        plan: true // Incluir os dados do plano na resposta
      }
    });

    console.log('Cliente criado com sucesso:', {
      id: customer.id,
      name: customer.full_name,
      planId: customer.planId,
      contract_number: customer.contract_number
    });

    return res.status(201).json({
      message: 'Cliente criado com sucesso',
      customer
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um cliente existente
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      document_type,
      document_number,
      email,
      phone,
      whatsapp,
      status,
      address,
      address_number,
      address_complement,
      neighborhood,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      installation_date,
      pppoe_username,
      pppoe_password,
      ip_address,
      download_limit,
      upload_limit,
      due_day,
      payment_method,
      planId,
      contract_number
    } = req.body;

    console.log('Atualizando cliente com os dados:', { 
      id,
      full_name, 
      planId, 
      installation_date, 
      contract_number 
    });

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Verifica se os dados únicos não colidem com outros clientes
    if (email && email !== customer.email) {
      const emailExists = await prisma.customer.findFirst({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Este e-mail já está em uso' });
      }
    }

    if (document_number && document_number !== customer.document_number) {
      const documentExists = await prisma.customer.findFirst({
        where: { document_number }
      });

      if (documentExists) {
        return res.status(400).json({ message: 'Este documento já está em uso' });
      }
    }

    // Verifica se o plano existe, caso tenha sido informado
    if (planId) {
      console.log('Verificando se existe o plano com ID:', planId);
      const planExists = await prisma.plan.findUnique({
        where: { id: planId }
      });

      console.log('Plano encontrado?', !!planExists);
      if (!planExists) {
        return res.status(400).json({ message: 'Plano não encontrado' });
      }
    }

    // Atualiza o cliente
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        full_name: full_name !== undefined ? full_name : undefined,
        document_type: document_type !== undefined ? document_type.toUpperCase() : undefined,
        document_number: document_number !== undefined ? document_number : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        whatsapp: whatsapp !== undefined ? whatsapp : undefined,
        status: status !== undefined ? status : undefined,
        address: address !== undefined ? address : undefined,
        address_number: address_number !== undefined ? address_number : undefined,
        address_complement: address_complement !== undefined ? address_complement : undefined,
        neighborhood: neighborhood !== undefined ? neighborhood : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        zip_code: zip_code !== undefined ? zip_code : undefined,
        latitude: latitude !== undefined ? latitude : undefined,
        longitude: longitude !== undefined ? longitude : undefined,
        installation_date: installation_date !== undefined ? new Date(installation_date) : undefined,
        pppoe_username: pppoe_username !== undefined ? pppoe_username : undefined,
        pppoe_password: pppoe_password !== undefined ? pppoe_password : undefined,
        ip_address: ip_address !== undefined ? ip_address : undefined,
        download_limit: download_limit !== undefined ? download_limit : undefined,
        upload_limit: upload_limit !== undefined ? upload_limit : undefined,
        due_day: due_day !== undefined ? due_day : undefined,
        payment_method: payment_method !== undefined ? payment_method : undefined,
        planId: planId !== undefined ? planId : undefined,
        contract_number: contract_number !== undefined ? contract_number : undefined
      },
      include: {
        plan: true
      }
    });

    console.log('Cliente atualizado com sucesso:', {
      id: updatedCustomer.id,
      name: updatedCustomer.full_name,
      planId: updatedCustomer.planId,
      contract_number: updatedCustomer.contract_number
    });

    return res.json({
      message: 'Cliente atualizado com sucesso',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Exclui um cliente
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Antes de excluir, verifica se há faturas, tickets ou contratos pendentes
    const [invoices, tickets, contracts] = await Promise.all([
      prisma.invoice.findMany({
        where: { customerId: id, status: { in: ['PENDING', 'OVERDUE'] } }
      }),
      prisma.supportTicket.findMany({
        where: { customerId: id, status: { in: ['OPEN', 'IN_PROGRESS'] } }
      }),
      prisma.contract.findMany({
        where: { customerId: id, status: 'ACTIVE' }
      })
    ]);

    // Se houver itens pendentes, retorna erro
    if (invoices.length > 0 || tickets.length > 0 || contracts.length > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir este cliente pois existem pendências associadas a ele',
        pendingItems: {
          invoices: invoices.length,
          tickets: tickets.length,
          contracts: contracts.length
        }
      });
    }

    // Exclui o cliente
    await prisma.customer.delete({
      where: { id }
    });

    return res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém as faturas de um cliente
 */
export const getCustomerInvoices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Busca as faturas do cliente
    const invoices = await prisma.invoice.findMany({
      where: { customerId: id },
      orderBy: { dueDate: 'desc' },
      include: {
        payments: true
      }
    });

    return res.json(invoices);
  } catch (error) {
    console.error('Erro ao buscar faturas do cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém os tickets de suporte de um cliente
 */
export const getCustomerTickets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Busca os tickets do cliente
    const tickets = await prisma.supportTicket.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar tickets do cliente:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 