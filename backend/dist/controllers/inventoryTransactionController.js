"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryTransaction = exports.updateInventoryTransaction = exports.createInventoryTransaction = exports.getInventoryTransactionById = exports.getAllInventoryTransactions = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Listar todas as transações de inventário
 * @route GET /api/inventory-transactions
 */
const getAllInventoryTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtros
        const type = req.query.type;
        const itemId = req.query.itemId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        // Construir o objeto where com base nos filtros
        const where = {};
        if (type)
            where.type = type;
        if (itemId)
            where.itemId = itemId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        // Buscar transações com paginação
        const [transactions, total] = yield Promise.all([
            prisma_1.prisma.inventoryTransaction.findMany({
                where,
                include: {
                    item: true
                },
                orderBy: [
                    { date: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma_1.prisma.inventoryTransaction.count({ where })
        ]);
        return res.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar transações de inventário:', error);
        return res.status(500).json({ error: 'Erro ao buscar transações de inventário' });
    }
});
exports.getAllInventoryTransactions = getAllInventoryTransactions;
/**
 * Obter uma transação de inventário por ID
 * @route GET /api/inventory-transactions/:id
 */
const getInventoryTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const transaction = yield prisma_1.prisma.inventoryTransaction.findUnique({
            where: { id },
            include: {
                item: true
            }
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transação de inventário não encontrada' });
        }
        return res.json(transaction);
    }
    catch (error) {
        console.error('Erro ao buscar transação de inventário:', error);
        return res.status(500).json({ error: 'Erro ao buscar transação de inventário' });
    }
});
exports.getInventoryTransactionById = getInventoryTransactionById;
/**
 * Criar uma nova transação de inventário
 * @route POST /api/inventory-transactions
 */
const createInventoryTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId, type, quantity, date, notes } = req.body;
        // Validação básica
        if (!itemId || !type || !quantity) {
            return res.status(400).json({
                error: 'ID do item, tipo e quantidade são obrigatórios'
            });
        }
        // Verificar se o item existe
        const item = yield prisma_1.prisma.inventoryItem.findUnique({
            where: { id: itemId }
        });
        if (!item) {
            return res.status(404).json({ error: 'Item de inventário não encontrado' });
        }
        // Verificar se há quantidade suficiente para saída
        if (type === 'out' && item.quantity < quantity) {
            return res.status(400).json({
                error: 'Quantidade insuficiente em estoque'
            });
        }
        // Iniciar transação do banco de dados
        const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Criar transação
            const transaction = yield tx.inventoryTransaction.create({
                data: {
                    itemId,
                    type,
                    quantity,
                    date: date ? new Date(date) : new Date(),
                    notes
                }
            });
            // Atualizar quantidade do item
            const newQuantity = type === 'in'
                ? item.quantity + quantity
                : item.quantity - quantity;
            yield tx.inventoryItem.update({
                where: { id: itemId },
                data: { quantity: newQuantity }
            });
            return transaction;
        }));
        return res.status(201).json({
            message: 'Transação de inventário criada com sucesso',
            transaction: result
        });
    }
    catch (error) {
        console.error('Erro ao criar transação de inventário:', error);
        return res.status(500).json({ error: 'Erro ao criar transação de inventário' });
    }
});
exports.createInventoryTransaction = createInventoryTransaction;
/**
 * Atualizar uma transação de inventário
 * @route PUT /api/inventory-transactions/:id
 */
const updateInventoryTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { itemId, type, quantity, date, notes } = req.body;
        // Verificar se a transação existe
        const transaction = yield prisma_1.prisma.inventoryTransaction.findUnique({
            where: { id },
            include: {
                item: true
            }
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transação de inventário não encontrada' });
        }
        // Verificar se o item existe (se foi alterado)
        if (itemId && itemId !== transaction.itemId) {
            const item = yield prisma_1.prisma.inventoryItem.findUnique({
                where: { id: itemId }
            });
            if (!item) {
                return res.status(404).json({ error: 'Item de inventário não encontrado' });
            }
        }
        // Iniciar transação do banco de dados
        const result = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Reverter quantidade anterior
            const oldQuantity = transaction.type === 'in'
                ? transaction.item.quantity - transaction.quantity
                : transaction.item.quantity + transaction.quantity;
            yield tx.inventoryItem.update({
                where: { id: transaction.itemId },
                data: { quantity: oldQuantity }
            });
            // Atualizar transação
            const updatedTransaction = yield tx.inventoryTransaction.update({
                where: { id },
                data: {
                    itemId: itemId || undefined,
                    type: type || undefined,
                    quantity: quantity || undefined,
                    date: date ? new Date(date) : undefined,
                    notes: notes !== undefined ? notes : undefined
                },
                include: {
                    item: true
                }
            });
            // Aplicar nova quantidade
            const newQuantity = updatedTransaction.type === 'in'
                ? updatedTransaction.item.quantity + updatedTransaction.quantity
                : updatedTransaction.item.quantity - updatedTransaction.quantity;
            yield tx.inventoryItem.update({
                where: { id: updatedTransaction.itemId },
                data: { quantity: newQuantity }
            });
            return updatedTransaction;
        }));
        return res.json({
            message: 'Transação de inventário atualizada com sucesso',
            transaction: result
        });
    }
    catch (error) {
        console.error('Erro ao atualizar transação de inventário:', error);
        return res.status(500).json({ error: 'Erro ao atualizar transação de inventário' });
    }
});
exports.updateInventoryTransaction = updateInventoryTransaction;
/**
 * Excluir uma transação de inventário
 * @route DELETE /api/inventory-transactions/:id
 */
const deleteInventoryTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se a transação existe
        const transaction = yield prisma_1.prisma.inventoryTransaction.findUnique({
            where: { id },
            include: {
                item: true
            }
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transação de inventário não encontrada' });
        }
        // Iniciar transação do banco de dados
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Reverter quantidade
            const newQuantity = transaction.type === 'in'
                ? transaction.item.quantity - transaction.quantity
                : transaction.item.quantity + transaction.quantity;
            yield tx.inventoryItem.update({
                where: { id: transaction.itemId },
                data: { quantity: newQuantity }
            });
            // Excluir transação
            yield tx.inventoryTransaction.delete({
                where: { id }
            });
        }));
        return res.json({ message: 'Transação de inventário excluída com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir transação de inventário:', error);
        return res.status(500).json({ error: 'Erro ao excluir transação de inventário' });
    }
});
exports.deleteInventoryTransaction = deleteInventoryTransaction;
