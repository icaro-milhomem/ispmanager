"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mileageLogController_1 = require("../controllers/mileageLogController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os registros de quilometragem
router.get('/', mileageLogController_1.getAllMileageLogs);
// Obter um registro de quilometragem por ID
router.get('/:id', mileageLogController_1.getMileageLogById);
// Criar um novo registro de quilometragem
router.post('/', mileageLogController_1.createMileageLog);
// Atualizar um registro de quilometragem
router.put('/:id', mileageLogController_1.updateMileageLog);
// Excluir um registro de quilometragem
router.delete('/:id', mileageLogController_1.deleteMileageLog);
exports.default = router;
