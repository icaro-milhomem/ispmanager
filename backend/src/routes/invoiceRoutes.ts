import { Router } from 'express';
import { 
  getAllInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice,
  registerPayment,
  getPaymentsByInvoice
} from '../controllers/invoiceController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// TEMPORÁRIO: Removendo autenticação de todas as rotas
// router.use(authMiddleware);

// Rotas de fatura
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

// Registro de pagamentos
router.post('/:id/payments', registerPayment);
router.get('/:id/payments', getPaymentsByInvoice);

export default router; 