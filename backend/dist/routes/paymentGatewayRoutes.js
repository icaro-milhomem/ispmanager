"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentGatewayController_1 = require("../controllers/paymentGatewayController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os gateways de pagamento
router.get('/', paymentGatewayController_1.getAllPaymentGateways);
// Obter um gateway de pagamento por ID
router.get('/:id', paymentGatewayController_1.getPaymentGatewayById);
// Criar um novo gateway de pagamento
router.post('/', paymentGatewayController_1.createPaymentGateway);
// Atualizar um gateway de pagamento
router.put('/:id', paymentGatewayController_1.updatePaymentGateway);
// Excluir um gateway de pagamento
router.delete('/:id', paymentGatewayController_1.deletePaymentGateway);
exports.default = router;
