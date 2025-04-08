import { Router } from 'express';
import { 
  getAllCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerInvoices,
  getCustomerTickets
} from '../controllers/customerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de clientes requerem autenticação
router.use(authMiddleware);

// Listar todos os clientes
router.get('/', getAllCustomers);

// Obter cliente específico
router.get('/:id', getCustomerById);

// Obter faturas de um cliente
router.get('/:id/invoices', getCustomerInvoices);

// Obter tickets de um cliente
router.get('/:id/tickets', getCustomerTickets);

// Criar novo cliente
router.post('/', createCustomer);

// Atualizar cliente
router.put('/:id', updateCustomer);

// Excluir cliente
router.delete('/:id', deleteCustomer);

export default router; 