import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todos os tickets
 */
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const { status, priority } = req.query;
    
    // Construir filtro de busca
    let where: any = {};
    
    // Filtrar por status
    if (status) {
      where.status = status;
    }
    
    // Filtrar por prioridade
    if (priority) {
      where.priority = priority;
    }

    // Busca paginada de tickets
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Busca os tickets
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          customer: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.supportTicket.count({ where })
    ]);

    // Verificar se o dashboard está solicitando sem paginação
    if (req.query.dashboard === 'true') {
      return res.json(tickets);
    }
    
    return res.json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém um ticket específico
 */
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        responses: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }

    return res.json(ticket);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo ticket
 */
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { 
      customerId,
      title,
      description,
      priority = 'MEDIUM',
      userId
    } = req.body;

    // Validações básicas
    if (!customerId || !title || !description) {
      return res.status(400).json({ 
        message: 'Cliente, título e descrição são obrigatórios' 
      });
    }

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(400).json({ message: 'Cliente não encontrado' });
    }

    // Cria o ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        priority,
        status: 'OPEN',
        customer: {
          connect: { id: customerId }
        },
        ...(userId && {
          user: {
            connect: { id: userId }
          }
        })
      },
      include: {
        customer: {
          select: {
            full_name: true,
            email: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Ticket criado com sucesso',
      ticket
    });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um ticket existente
 */
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title,
      description,
      status,
      priority,
      userId
    } = req.body;

    // Verifica se o ticket existe
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }

    // Não permite alterar tickets fechados
    if (ticket.status === 'CLOSED' && status !== 'REOPENED') {
      return res.status(400).json({ 
        message: 'Não é possível alterar tickets fechados. Reabra o ticket primeiro.' 
      });
    }

    // Atualiza o ticket
    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        ...(userId && {
          user: {
            connect: { id: userId }
          }
        })
      }
    });

    return res.json({
      message: 'Ticket atualizado com sucesso',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Exclui um ticket
 */
export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o ticket existe
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: { responses: true }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }

    // Não permite excluir tickets com respostas
    if (ticket.responses.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir tickets com respostas' 
      });
    }

    // Exclui o ticket
    await prisma.supportTicket.delete({
      where: { id }
    });

    return res.json({ message: 'Ticket excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir ticket:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Adiciona uma resposta a um ticket
 */
export const addTicketResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      message,
      respondentName,
      isCustomer = false
    } = req.body;

    // Validações básicas
    if (!message || !respondentName) {
      return res.status(400).json({ 
        message: 'Mensagem e nome do respondente são obrigatórios' 
      });
    }

    // Verifica se o ticket existe
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }

    // Não permite responder tickets fechados
    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ 
        message: 'Não é possível responder tickets fechados' 
      });
    }

    // Cria a resposta ao ticket
    const response = await prisma.ticketResponse.create({
      data: {
        message,
        respondentName,
        isCustomer,
        ticket: {
          connect: { id }
        }
      }
    });

    // Atualiza o status do ticket para "em andamento" se estava aberto
    if (ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return res.status(201).json({
      message: 'Resposta adicionada com sucesso',
      response
    });
  } catch (error) {
    console.error('Erro ao adicionar resposta:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém as respostas de um ticket
 */
export const getTicketResponses = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o ticket existe
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }

    // Busca as respostas
    const responses = await prisma.ticketResponse.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(responses);
  } catch (error) {
    console.error('Erro ao buscar respostas do ticket:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 