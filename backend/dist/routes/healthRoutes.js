"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
// Rota para verificar a saúde do sistema
router.get('/', healthController_1.checkHealth);
exports.default = router;
