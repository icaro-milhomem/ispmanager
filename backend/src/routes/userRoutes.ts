import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// TEMPORÁRIO: Removendo autenticação de rotas de usuário
// router.use(authMiddleware);

// Listar todos os usuários (apenas admin)
router.get('/', getAllUsers);

// Obter usuário específico
router.get('/:id', getUserById);

// Criar novo usuário (remover necessidade de ser admin)
router.post('/', createUser);

// Atualizar usuário
router.put('/:id', updateUser);

// Excluir usuário (apenas admin)
router.delete('/:id', adminMiddleware, deleteUser);

export default router; 