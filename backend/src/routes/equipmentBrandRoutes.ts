import { Router } from 'express';
import { 
  getAllEquipmentBrands, 
  getEquipmentBrandById, 
  createEquipmentBrand, 
  updateEquipmentBrand, 
  deleteEquipmentBrand 
} from '../controllers/equipmentBrandController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todas as marcas
router.get('/', getAllEquipmentBrands);

// Obter uma marca por ID
router.get('/:id', getEquipmentBrandById);

// Criar uma nova marca
router.post('/', createEquipmentBrand);

// Atualizar uma marca
router.put('/:id', updateEquipmentBrand);

// Excluir uma marca
router.delete('/:id', deleteEquipmentBrand);

export default router; 