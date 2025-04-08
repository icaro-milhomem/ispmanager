import express from 'express';
import {
  getAllInventoryTransactions,
  getInventoryTransactionById,
  createInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction
} from '../controllers/inventoryTransactionController';

const router = express.Router();

// Listar todas as transações de inventário
router.get('/', getAllInventoryTransactions);

// Obter uma transação de inventário pelo ID
router.get('/:id', getInventoryTransactionById);

// Criar uma nova transação de inventário
router.post('/', createInventoryTransaction);

// Atualizar uma transação de inventário
router.put('/:id', updateInventoryTransaction);

// Excluir uma transação de inventário
router.delete('/:id', deleteInventoryTransaction);

export default router; 