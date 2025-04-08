"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const networkIssueController_1 = require("../controllers/networkIssueController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas para problemas de rede
router.get('/', networkIssueController_1.getAllNetworkIssues);
router.get('/:id', networkIssueController_1.getNetworkIssueById);
router.post('/', networkIssueController_1.createNetworkIssue);
router.put('/:id', networkIssueController_1.updateNetworkIssue);
router.delete('/:id', networkIssueController_1.deleteNetworkIssue);
exports.default = router;
