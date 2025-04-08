"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const equipmentController_1 = require("../controllers/equipmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os equipamentos
router.get('/', equipmentController_1.getAllEquipments);
// Obter um equipamento por ID
router.get('/:id', equipmentController_1.getEquipmentById);
// Criar um novo equipamento
router.post('/', equipmentController_1.createEquipment);
// Atualizar um equipamento
router.put('/:id', equipmentController_1.updateEquipment);
// Excluir um equipamento
router.delete('/:id', equipmentController_1.deleteEquipment);
exports.default = router;
