import { Router } from 'express';
import { getAllConfigs, getConfigById, createConfig, updateConfig, deleteConfig } from '../controllers/systemConfigController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública para obter configurações básicas (para login)
router.get('/', getAllConfigs);

// Rotas protegidas que exigem autenticação
router.use(authMiddleware);

// Rotas para configurações do sistema que exigem autenticação
router.get('/:id', getConfigById);
router.post('/', createConfig);
router.put('/:id', updateConfig);
router.delete('/:id', deleteConfig);

export default router; 