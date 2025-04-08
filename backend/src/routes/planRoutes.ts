import { Router } from 'express';
import { 
  getAllPlans, 
  getPlanById, 
  createPlan, 
  updatePlan, 
  deletePlan,
  getPlanCustomers
} from '../controllers/planController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Todas as rotas de planos requerem autenticação
router.use(authMiddleware);

// Listar todos os planos
router.get('/', getAllPlans);

// Obter plano específico
router.get('/:id', getPlanById);

// Obter clientes de um plano
router.get('/:id/customers', getPlanCustomers);

// Criar novo plano (apenas admin)
router.post('/', adminMiddleware, createPlan);

// Atualizar plano (apenas admin)
router.put('/:id', adminMiddleware, updatePlan);

// Excluir plano (apenas admin)
router.delete('/:id', adminMiddleware, deletePlan);

export default router; 