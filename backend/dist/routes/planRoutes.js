"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const planController_1 = require("../controllers/planController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = (0, express_1.Router)();
// Todas as rotas de planos requerem autenticação
router.use(authMiddleware_1.authMiddleware);
// Listar todos os planos
router.get('/', planController_1.getAllPlans);
// Obter plano específico
router.get('/:id', planController_1.getPlanById);
// Obter clientes de um plano
router.get('/:id/customers', planController_1.getPlanCustomers);
// Criar novo plano (apenas admin)
router.post('/', adminMiddleware_1.adminMiddleware, planController_1.createPlan);
// Atualizar plano (apenas admin)
router.put('/:id', adminMiddleware_1.adminMiddleware, planController_1.updatePlan);
// Excluir plano (apenas admin)
router.delete('/:id', adminMiddleware_1.adminMiddleware, planController_1.deletePlan);
exports.default = router;
