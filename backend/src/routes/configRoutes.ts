import { Router } from 'express';
import { 
  getSystemConfig, 
  updateSystemConfig 
} from '../controllers/configController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Obter configurações do sistema (público)
router.get('/', getSystemConfig);

// Criar configurações do sistema (apenas admin)
router.post('/', authMiddleware, updateSystemConfig);

// Atualizar configurações do sistema (apenas admin)
router.put('/', authMiddleware, adminMiddleware, updateSystemConfig);

export default router; 