"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contractController_1 = require("../controllers/contractController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os contratos
router.get('/', contractController_1.getAllContracts);
// Obter um contrato por ID
router.get('/:id', contractController_1.getContractById);
// Criar um novo contrato
router.post('/', contractController_1.createContract);
// Atualizar um contrato
router.put('/:id', contractController_1.updateContract);
// Excluir um contrato
router.delete('/:id', contractController_1.deleteContract);
exports.default = router;
