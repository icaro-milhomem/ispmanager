import express from 'express';
import {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventoryItemController';

const router = express.Router();

// Listar todos os itens de inventário
router.get('/', getAllInventoryItems);

// Obter um item de inventário pelo ID
router.get('/:id', getInventoryItemById);

// Criar um novo item de inventário
router.post('/', createInventoryItem);

// Atualizar um item de inventário
router.put('/:id', updateInventoryItem);

// Excluir um item de inventário
router.delete('/:id', deleteInventoryItem);

export default router; 