import { Router } from 'express';
import { checkHealth } from '../controllers/healthController';

const router = Router();

// Rota para verificar a saúde do sistema
router.get('/', checkHealth);

export default router; 