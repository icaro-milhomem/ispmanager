import { Router } from 'express';
import { 
  getAllBillingSchedules, 
  getBillingScheduleById, 
  createBillingSchedule, 
  updateBillingSchedule, 
  deleteBillingSchedule,
  executeBillingSchedule
} from '../controllers/billingScheduleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todas as programações de faturamento
router.get('/', getAllBillingSchedules);

// Obter uma programação de faturamento por ID
router.get('/:id', getBillingScheduleById);

// Criar uma nova programação de faturamento
router.post('/', createBillingSchedule);

// Atualizar uma programação de faturamento
router.put('/:id', updateBillingSchedule);

// Excluir uma programação de faturamento
router.delete('/:id', deleteBillingSchedule);

// Executar uma programação de faturamento manualmente
router.post('/:id/execute', executeBillingSchedule);

export default router; 