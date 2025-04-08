import { Router } from 'express';
import { 
  getAllFuelRefills, 
  getFuelRefillById, 
  createFuelRefill, 
  updateFuelRefill, 
  deleteFuelRefill 
} from '../controllers/fuelRefillController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os abastecimentos
router.get('/', getAllFuelRefills);

// Obter um abastecimento por ID
router.get('/:id', getFuelRefillById);

// Criar um novo abastecimento
router.post('/', createFuelRefill);

// Atualizar um abastecimento
router.put('/:id', updateFuelRefill);

// Excluir um abastecimento
router.delete('/:id', deleteFuelRefill);

export default router; 