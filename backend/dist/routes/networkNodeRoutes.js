"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const networkNodeController_1 = require("../controllers/networkNodeController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os nós de rede
router.get('/', networkNodeController_1.getAllNetworkNodes);
// Obter um nó de rede por ID
router.get('/:id', networkNodeController_1.getNetworkNodeById);
// Criar um novo nó de rede
router.post('/', networkNodeController_1.createNetworkNode);
// Atualizar um nó de rede
router.put('/:id', networkNodeController_1.updateNetworkNode);
// Excluir um nó de rede
router.delete('/:id', networkNodeController_1.deleteNetworkNode);
exports.default = router;
