import { Router } from 'express';
import { 
  getAllEquipments, 
  getEquipmentById, 
  createEquipment, 
  updateEquipment, 
  deleteEquipment 
} from '../controllers/equipmentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os equipamentos
router.get('/', getAllEquipments);

// Obter um equipamento por ID
router.get('/:id', getEquipmentById);

// Criar um novo equipamento
router.post('/', createEquipment);

// Atualizar um equipamento
router.put('/:id', updateEquipment);

// Excluir um equipamento
router.delete('/:id', deleteEquipment);

export default router; 