"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driverController_1 = require("../controllers/driverController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os motoristas
router.get('/', driverController_1.getAllDrivers);
// Obter um motorista por ID
router.get('/:id', driverController_1.getDriverById);
// Criar um novo motorista
router.post('/', driverController_1.createDriver);
// Atualizar um motorista
router.put('/:id', driverController_1.updateDriver);
// Excluir um motorista
router.delete('/:id', driverController_1.deleteDriver);
exports.default = router;
