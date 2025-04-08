import { Router } from 'express';
import { 
  getAllPaymentGateways, 
  getPaymentGatewayById, 
  createPaymentGateway, 
  updatePaymentGateway, 
  deletePaymentGateway 
} from '../controllers/paymentGatewayController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os gateways de pagamento
router.get('/', getAllPaymentGateways);

// Obter um gateway de pagamento por ID
router.get('/:id', getPaymentGatewayById);

// Criar um novo gateway de pagamento
router.post('/', createPaymentGateway);

// Atualizar um gateway de pagamento
router.put('/:id', updatePaymentGateway);

// Excluir um gateway de pagamento
router.delete('/:id', deletePaymentGateway);

export default router; 