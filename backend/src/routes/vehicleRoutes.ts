import { Router } from 'express';
import { 
  getAllVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../controllers/vehicleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os veículos
router.get('/', getAllVehicles);

// Obter um veículo por ID
router.get('/:id', getVehicleById);

// Criar um novo veículo
router.post('/', createVehicle);

// Atualizar um veículo
router.put('/:id', updateVehicle);

// Excluir um veículo
router.delete('/:id', deleteVehicle);

export default router; 