import { Router } from 'express';
import { 
  getAllMileageLogs, 
  getMileageLogById, 
  createMileageLog, 
  updateMileageLog, 
  deleteMileageLog 
} from '../controllers/mileageLogController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os registros de quilometragem
router.get('/', getAllMileageLogs);

// Obter um registro de quilometragem por ID
router.get('/:id', getMileageLogById);

// Criar um novo registro de quilometragem
router.post('/', createMileageLog);

// Atualizar um registro de quilometragem
router.put('/:id', updateMileageLog);

// Excluir um registro de quilometragem
router.delete('/:id', deleteMileageLog);

export default router; 