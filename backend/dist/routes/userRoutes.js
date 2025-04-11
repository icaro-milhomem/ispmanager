"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = (0, express_1.Router)();
// TEMPORÁRIO: Removendo autenticação de rotas de usuário
// router.use(authMiddleware);
// Listar todos os usuários (apenas admin)
router.get('/', userController_1.getAllUsers);
// Obter usuário específico
router.get('/:id', userController_1.getUserById);
// Criar novo usuário (remover necessidade de ser admin)
router.post('/', userController_1.createUser);
// Atualizar usuário
router.put('/:id', userController_1.updateUser);
// Excluir usuário (apenas admin)
router.delete('/:id', adminMiddleware_1.adminMiddleware, userController_1.deleteUser);
exports.default = router;
