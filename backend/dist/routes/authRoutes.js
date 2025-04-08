"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rota para login
router.post('/login', authController_1.login);
// Rota para cadastro de usuário
router.post('/register', authController_1.register);
// Rota para alteração de senha (requer autenticação)
router.post('/change-password', authMiddleware_1.authMiddleware, authController_1.changePassword);
exports.default = router;
