"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicleController_1 = require("../controllers/vehicleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os veículos
router.get('/', vehicleController_1.getAllVehicles);
// Obter um veículo por ID
router.get('/:id', vehicleController_1.getVehicleById);
// Criar um novo veículo
router.post('/', vehicleController_1.createVehicle);
// Atualizar um veículo
router.put('/:id', vehicleController_1.updateVehicle);
// Excluir um veículo
router.delete('/:id', vehicleController_1.deleteVehicle);
exports.default = router;
