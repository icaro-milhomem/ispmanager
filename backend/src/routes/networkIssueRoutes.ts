import { Router } from 'express';
import {
  getAllNetworkIssues,
  getNetworkIssueById,
  createNetworkIssue,
  updateNetworkIssue,
  deleteNetworkIssue
} from '../controllers/networkIssueController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para problemas de rede
router.get('/', getAllNetworkIssues);
router.get('/:id', getNetworkIssueById);
router.post('/', createNetworkIssue);
router.put('/:id', updateNetworkIssue);
router.delete('/:id', deleteNetworkIssue);

export default router; 