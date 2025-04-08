import { Router } from 'express';
import { login, register, changePassword } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota para login
router.post('/login', login);

// Rota para cadastro de usuário
router.post('/register', register);

// Rota para alteração de senha (requer autenticação)
router.post('/change-password', authMiddleware, changePassword);

export default router; 