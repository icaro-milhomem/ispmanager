import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todas as faturas
 */
export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const { status, month, year } = req.query;
    
    // Construir filtro de busca
    let where: any = {};
    
    // Filtrar por status
    if (status) {
      where.status = status;
    }
    
    // Filtrar por mês e ano
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0); // Último dia do mês

      where.dueDate = {
        gte: startDate,
        lte: endDate
      };
    }

    // Busca paginada de faturas
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Busca as faturas
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true
            }
          }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    // Verificar se o dashboard está solicitando sem paginação
    if (req.query.dashboard === 'true') {
      return res.json(invoices);
    }
    
    return res.json({
      invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém uma fatura específica
 */
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zip_code: true
          }
        },
        payments: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    return res.json(invoice);
  } catch (error) {
    console.error('Erro ao buscar fatura:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria uma nova fatura
 */
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { 
      customerId,
      amount,
      dueDate,
      description 
    } = req.body;

    // Validações básicas
    if (!customerId || !amount || !dueDate) {
      return res.status(400).json({ 
        message: 'Cliente, valor e data de vencimento são obrigatórios' 
      });
    }

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(400).json({ message: 'Cliente não encontrado' });
    }

    // Gera um número único para a fatura (pode ser baseado em um padrão específico)
    const date = new Date();
    const invoiceNumber = `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Cria a fatura
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        description,
        status: 'PENDING',
        customer: {
          connect: { id: customerId }
        }
      }
    });

    return res.status(201).json({
      message: 'Fatura criada com sucesso',
      invoice
    });
  } catch (error) {
    console.error('Erro ao criar fatura:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza uma fatura existente
 */
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      amount,
      dueDate,
      description,
      status
    } = req.body;

    // Verifica se a fatura existe
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    // Não permite alterar faturas pagas ou canceladas
    if (invoice.status === 'PAID' || invoice.status === 'CANCELED') {
      return res.status(400).json({ 
        message: 'Não é possível alterar faturas pagas ou canceladas' 
      });
    }

    // Atualiza a fatura
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        amount: amount !== undefined ? Number(amount) : undefined,
        dueDate: dueDate !== undefined ? new Date(dueDate) : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    return res.json({
      message: 'Fatura atualizada com sucesso',
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Erro ao atualizar fatura:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Exclui uma fatura
 */
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se a fatura existe
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    // Não permite excluir faturas pagas ou com pagamentos
    if (invoice.status === 'PAID' || invoice.payments.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir faturas pagas ou com pagamentos' 
      });
    }

    // Exclui a fatura
    await prisma.invoice.delete({
      where: { id }
    });

    return res.json({ message: 'Fatura excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fatura:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Registra pagamento para uma fatura
 */
export const registerPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      amount,
      method,
      date,
      transaction,
      notes
    } = req.body;

    // Validações básicas
    if (!amount || !method || !date) {
      return res.status(400).json({ 
        message: 'Valor, método de pagamento e data são obrigatórios' 
      });
    }

    // Verifica se a fatura existe
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    // Não permite registrar pagamento para faturas canceladas
    if (invoice.status === 'CANCELED') {
      return res.status(400).json({ 
        message: 'Não é possível registrar pagamento para faturas canceladas' 
      });
    }

    // Inicia transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Registra o pagamento
      const payment = await tx.payment.create({
        data: {
          amount: Number(amount),
          method,
          date: new Date(date),
          transaction,
          notes,
          invoice: {
            connect: { id }
          }
        }
      });

      // Atualiza o status da fatura se o valor total foi pago
      const payments = await tx.payment.findMany({
        where: { invoiceId: id }
      });

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      // Se o total pago for maior ou igual ao valor da fatura, marca como paga
      if (totalPaid >= invoice.amount) {
        await tx.invoice.update({
          where: { id },
          data: {
            status: 'PAID',
            paymentDate: new Date()
          }
        });
      }

      return { payment, totalPaid, invoiceAmount: invoice.amount };
    });

    return res.status(201).json({
      message: 'Pagamento registrado com sucesso',
      payment: result.payment,
      invoiceStatus: result.totalPaid >= result.invoiceAmount ? 'PAID' : 'PENDING',
      totalPaid: result.totalPaid,
      remaining: Math.max(0, result.invoiceAmount - result.totalPaid)
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém os pagamentos de uma fatura
 */
export const getPaymentsByInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se a fatura existe
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    // Busca os pagamentos
    const payments = await prisma.payment.findMany({
      where: { invoiceId: id },
      orderBy: { date: 'desc' }
    });

    // Calcula o total pago
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return res.json({
      invoice: {
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        status: invoice.status
      },
      payments,
      totalPaid,
      remaining: Math.max(0, invoice.amount - totalPaid)
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 