"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ipPoolController_1 = require("../controllers/ipPoolController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas para pools de IP
router.get('/', ipPoolController_1.getAllIPPools);
router.get('/:id', ipPoolController_1.getIPPoolById);
router.post('/', ipPoolController_1.createIPPool);
router.put('/:id', ipPoolController_1.updateIPPool);
router.delete('/:id', ipPoolController_1.deleteIPPool);
// Rota para listar todas as atribuições de IP do sistema
router.get('/assignments/all', ipPoolController_1.getAllIPAssignments);
// Rotas para atribuições de IP em um pool específico
router.get('/:poolId/assignments', ipPoolController_1.getIPAssignments);
router.post('/:poolId/assignments', ipPoolController_1.addIPAssignment);
router.put('/:poolId/assignments/:assignmentId', ipPoolController_1.updateIPAssignment);
router.delete('/:poolId/assignments/:assignmentId', ipPoolController_1.deleteIPAssignment);
exports.default = router;
