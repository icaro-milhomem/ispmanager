import { Router } from 'express';
import { 
  getAllTickets, 
  getTicketById, 
  createTicket, 
  updateTicket, 
  deleteTicket,
  addTicketResponse,
  getTicketResponses
} from '../controllers/ticketController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os tickets
router.get('/', getAllTickets);

// Obter ticket específico
router.get('/:id', getTicketById);

// Obter respostas de um ticket
router.get('/:id/responses', getTicketResponses);

// Criar novo ticket
router.post('/', createTicket);

// Adicionar resposta a um ticket
router.post('/:id/responses', addTicketResponse);

// Atualizar ticket
router.put('/:id', updateTicket);

// Excluir ticket
router.delete('/:id', deleteTicket);

export default router; 