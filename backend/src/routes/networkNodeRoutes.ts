import { Router } from 'express';
import { 
  getAllNetworkNodes, 
  getNetworkNodeById, 
  createNetworkNode, 
  updateNetworkNode, 
  deleteNetworkNode 
} from '../controllers/networkNodeController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os nós de rede
router.get('/', getAllNetworkNodes);

// Obter um nó de rede por ID
router.get('/:id', getNetworkNodeById);

// Criar um novo nó de rede
router.post('/', createNetworkNode);

// Atualizar um nó de rede
router.put('/:id', updateNetworkNode);

// Excluir um nó de rede
router.delete('/:id', deleteNetworkNode);

export default router; 