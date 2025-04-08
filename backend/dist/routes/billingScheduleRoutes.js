"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billingScheduleController_1 = require("../controllers/billingScheduleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todas as programações de faturamento
router.get('/', billingScheduleController_1.getAllBillingSchedules);
// Obter uma programação de faturamento por ID
router.get('/:id', billingScheduleController_1.getBillingScheduleById);
// Criar uma nova programação de faturamento
router.post('/', billingScheduleController_1.createBillingSchedule);
// Atualizar uma programação de faturamento
router.put('/:id', billingScheduleController_1.updateBillingSchedule);
// Excluir uma programação de faturamento
router.delete('/:id', billingScheduleController_1.deleteBillingSchedule);
// Executar uma programação de faturamento manualmente
router.post('/:id/execute', billingScheduleController_1.executeBillingSchedule);
exports.default = router;
