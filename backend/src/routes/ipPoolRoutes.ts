import { Router } from 'express';
import {
  getAllIPPools,
  getIPPoolById,
  createIPPool,
  updateIPPool,
  deleteIPPool,
  addIPAssignment,
  updateIPAssignment,
  deleteIPAssignment,
  getIPAssignments,
  getAllIPAssignments
} from '../controllers/ipPoolController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para pools de IP
router.get('/', getAllIPPools);
router.get('/:id', getIPPoolById);
router.post('/', createIPPool);
router.put('/:id', updateIPPool);
router.delete('/:id', deleteIPPool);

// Rota para listar todas as atribuições de IP do sistema
router.get('/assignments/all', getAllIPAssignments);

// Rotas para atribuições de IP em um pool específico
router.get('/:poolId/assignments', getIPAssignments);
router.post('/:poolId/assignments', addIPAssignment);
router.put('/:poolId/assignments/:assignmentId', updateIPAssignment);
router.delete('/:poolId/assignments/:assignmentId', deleteIPAssignment);

export default router; 