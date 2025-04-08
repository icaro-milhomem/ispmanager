"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const equipmentBrandController_1 = require("../controllers/equipmentBrandController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Listar todas as marcas
router.get('/', equipmentBrandController_1.getAllEquipmentBrands);
// Obter uma marca por ID
router.get('/:id', equipmentBrandController_1.getEquipmentBrandById);
// Criar uma nova marca
router.post('/', equipmentBrandController_1.createEquipmentBrand);
// Atualizar uma marca
router.put('/:id', equipmentBrandController_1.updateEquipmentBrand);
// Excluir uma marca
router.delete('/:id', equipmentBrandController_1.deleteEquipmentBrand);
exports.default = router;
