"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const systemConfigController_1 = require("../controllers/systemConfigController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rota pública para obter configurações básicas (para login)
router.get('/', systemConfigController_1.getAllConfigs);
// Rotas protegidas que exigem autenticação
router.use(authMiddleware_1.authMiddleware);
// Rotas para configurações do sistema que exigem autenticação
router.get('/:id', systemConfigController_1.getConfigById);
router.post('/', systemConfigController_1.createConfig);
router.put('/:id', systemConfigController_1.updateConfig);
router.delete('/:id', systemConfigController_1.deleteConfig);
exports.default = router;
