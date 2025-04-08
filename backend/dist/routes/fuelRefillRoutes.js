"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fuelRefillController_1 = require("../controllers/fuelRefillController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todos os abastecimentos
router.get('/', fuelRefillController_1.getAllFuelRefills);
// Obter um abastecimento por ID
router.get('/:id', fuelRefillController_1.getFuelRefillById);
// Criar um novo abastecimento
router.post('/', fuelRefillController_1.createFuelRefill);
// Atualizar um abastecimento
router.put('/:id', fuelRefillController_1.updateFuelRefill);
// Excluir um abastecimento
router.delete('/:id', fuelRefillController_1.deleteFuelRefill);
exports.default = router;
