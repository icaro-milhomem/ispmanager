import { Router } from 'express';
import { 
  getAllDrivers, 
  getDriverById, 
  createDriver, 
  updateDriver, 
  deleteDriver 
} from '../controllers/driverController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os motoristas
router.get('/', getAllDrivers);

// Obter um motorista por ID
router.get('/:id', getDriverById);

// Criar um novo motorista
router.post('/', createDriver);

// Atualizar um motorista
router.put('/:id', updateDriver);

// Excluir um motorista
router.delete('/:id', deleteDriver);

export default router; 