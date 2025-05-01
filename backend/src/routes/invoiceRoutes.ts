import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todas as faturas
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true
          }
        },
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Erro ao listar faturas:', error);
    res.status(500).json({ error: 'Erro ao listar faturas' });
  }
});

// Obter uma fatura específica
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true
          }
        },
        payments: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Erro ao buscar fatura:', error);
    res.status(500).json({ error: 'Erro ao buscar fatura' });
  }
});

// Criar nova fatura
router.post('/', async (req, res) => {
  try {
    const { customerId, amount, dueDate, description } = req.body;

    // Gerar número da fatura (você pode implementar sua própria lógica)
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { number: 'desc' }
    });
    
    const nextNumber = lastInvoice 
      ? String(Number(lastInvoice.number) + 1).padStart(6, '0')
      : '000001';

    const invoice = await prisma.invoice.create({
      data: {
        number: nextNumber,
        customerId,
        amount,
        dueDate: new Date(dueDate),
        description,
        status: 'PENDING'
      },
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
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Erro ao criar fatura:', error);
    res.status(500).json({ error: 'Erro ao criar fatura' });
  }
});

// Atualizar fatura
router.put('/:id', async (req, res) => {
  try {
    const { amount, dueDate, description, status, paymentDate } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        amount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        description,
        status,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined
      },
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
    });

    res.json(invoice);
  } catch (error) {
    console.error('Erro ao atualizar fatura:', error);
    res.status(500).json({ error: 'Erro ao atualizar fatura' });
  }
});

// Excluir fatura
router.delete('/:id', async (req, res) => {
  try {
    await prisma.invoice.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir fatura:', error);
    res.status(500).json({ error: 'Erro ao excluir fatura' });
  }
});

// Registrar pagamento
router.post('/:id/payments', async (req, res) => {
  try {
    const { amount, method, date, transaction, notes } = req.body;

    const payment = await prisma.payment.create({
      data: {
        invoiceId: req.params.id,
        amount,
        method,
        date: new Date(date),
        transaction,
        notes
      }
    });

    // Atualizar status da fatura
    await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        status: 'PAID',
        paymentDate: new Date(date)
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

// Listar pagamentos de uma fatura
router.get('/:id/payments', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoiceId: req.params.id },
      orderBy: { date: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
});

export default router; 