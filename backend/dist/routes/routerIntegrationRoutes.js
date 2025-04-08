"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routerIntegrationController_1 = require("../controllers/routerIntegrationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas para integrações de roteadores
router.get('/', routerIntegrationController_1.getAllRouterIntegrations);
router.get('/:id', routerIntegrationController_1.getRouterIntegrationById);
router.post('/', routerIntegrationController_1.createRouterIntegration);
router.put('/:id', routerIntegrationController_1.updateRouterIntegration);
router.delete('/:id', routerIntegrationController_1.deleteRouterIntegration);
exports.default = router;
