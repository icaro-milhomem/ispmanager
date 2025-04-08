"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryTransactionController_1 = require("../controllers/inventoryTransactionController");
const router = express_1.default.Router();
// Listar todas as transações de inventário
router.get('/', inventoryTransactionController_1.getAllInventoryTransactions);
// Obter uma transação de inventário pelo ID
router.get('/:id', inventoryTransactionController_1.getInventoryTransactionById);
// Criar uma nova transação de inventário
router.post('/', inventoryTransactionController_1.createInventoryTransaction);
// Atualizar uma transação de inventário
router.put('/:id', inventoryTransactionController_1.updateInventoryTransaction);
// Excluir uma transação de inventário
router.delete('/:id', inventoryTransactionController_1.deleteInventoryTransaction);
exports.default = router;
