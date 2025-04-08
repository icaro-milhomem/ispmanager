"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configController_1 = require("../controllers/configController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = (0, express_1.Router)();
// Obter configurações do sistema (público)
router.get('/', configController_1.getSystemConfig);
// Atualizar configurações do sistema (apenas admin)
router.put('/', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, configController_1.updateSystemConfig);
exports.default = router;
