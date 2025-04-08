import { Router } from 'express';
import {
  getAllRouterIntegrations,
  getRouterIntegrationById,
  createRouterIntegration,
  updateRouterIntegration,
  deleteRouterIntegration
} from '../controllers/routerIntegrationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para integrações de roteadores
router.get('/', getAllRouterIntegrations);
router.get('/:id', getRouterIntegrationById);
router.post('/', createRouterIntegration);
router.put('/:id', updateRouterIntegration);
router.delete('/:id', deleteRouterIntegration);

export default router; 