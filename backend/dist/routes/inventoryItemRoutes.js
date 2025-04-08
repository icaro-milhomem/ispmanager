"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryItemController_1 = require("../controllers/inventoryItemController");
const router = express_1.default.Router();
// Listar todos os itens de inventário
router.get('/', inventoryItemController_1.getAllInventoryItems);
// Obter um item de inventário pelo ID
router.get('/:id', inventoryItemController_1.getInventoryItemById);
// Criar um novo item de inventário
router.post('/', inventoryItemController_1.createInventoryItem);
// Atualizar um item de inventário
router.put('/:id', inventoryItemController_1.updateInventoryItem);
// Excluir um item de inventário
router.delete('/:id', inventoryItemController_1.deleteInventoryItem);
exports.default = router;
