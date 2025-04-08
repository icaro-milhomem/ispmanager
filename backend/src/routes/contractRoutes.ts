import { Router } from 'express';
import { 
  getAllContracts, 
  getContractById, 
  createContract, 
  updateContract, 
  deleteContract 
} from '../controllers/contractController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os contratos
router.get('/', getAllContracts);

// Obter um contrato por ID
router.get('/:id', getContractById);

// Criar um novo contrato
router.post('/', createContract);

// Atualizar um contrato
router.put('/:id', updateContract);

// Excluir um contrato
router.delete('/:id', deleteContract);

export default router; 