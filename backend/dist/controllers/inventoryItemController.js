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
exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItemById = exports.getAllInventoryItems = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Listar todos os itens de inventário
 * @route GET /api/inventory-items
 */
const getAllInventoryItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtros
        const status = req.query.status;
        const category = req.query.category;
        const search = req.query.search;
        // Construir o objeto where com base nos filtros
        const where = {};
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { serial_number: { contains: search, mode: 'insensitive' } }
            ];
        }
        // Buscar itens de inventário com paginação
        const [items, total] = yield Promise.all([
            prisma_1.prisma.inventoryItem.findMany({
                where,
                orderBy: [
                    { name: 'asc' }
                ],
                skip,
                take: limit
            }),
            prisma_1.prisma.inventoryItem.count({ where })
        ]);
        return res.json({
            items,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar itens de inventário:', error);
        return res.status(500).json({ error: 'Erro ao buscar itens de inventário' });
    }
});
exports.getAllInventoryItems = getAllInventoryItems;
/**
 * Obter um item de inventário por ID
 * @route GET /api/inventory-items/:id
 */
const getInventoryItemById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield prisma_1.prisma.inventoryItem.findUnique({
            where: { id }
        });
        if (!item) {
            return res.status(404).json({ error: 'Item de inventário não encontrado' });
        }
        return res.json(item);
    }
    catch (error) {
        console.error('Erro ao buscar item de inventário:', error);
        return res.status(500).json({ error: 'Erro ao buscar item de inventário' });
    }
});
exports.getInventoryItemById = getInventoryItemById;
/**
 * Criar um novo item de inventário
 * @route POST /api/inventory-items
 */
const createInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, category, quantity, unit_price, status, supplier, location, serial_number, purchase_date, warranty_expiry, notes } = req.body;
        // Validação básica
        if (!name || !category || !quantity || !unit_price) {
            return res.status(400).json({
                error: 'Nome, categoria, quantidade e preço unitário são obrigatórios'
            });
        }
        // Criar item de inventário
        const item = yield prisma_1.prisma.inventoryItem.create({
            data: {
                name,
                description,
                category,
                quantity,
                unit_price,
                status: status || 'active',
                supplier,
                location,
                serial_number,
                purchase_date: purchase_date ? new Date(purchase_date) : null,
                warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : null,
                notes
            }
        });
        return res.status(201).json({
            message: 'Item de inventário criado com sucesso',
            item
        });
    }
    catch (error) {
        console.error('Erro ao criar item de inventário:', error);
        return res.status(500).json({ error: 'Erro ao criar item de inventário' });
    }
});
exports.createInventoryItem = createInventoryItem;
/**
 * Atualizar um item de inventário
 * @route PUT /api/inventory-items/:id
 */
const updateInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, category, quantity, unit_price, status, supplier, location, serial_number, purchase_date, warranty_expiry, notes } = req.body;
        // Verificar se o item existe
        const item = yield prisma_1.prisma.inventoryItem.findUnique({
            where: { id }
        });
        if (!item) {
            return res.status(404).json({ error: 'Item de inventário não encontrado' });
        }
        // Atualizar item
        const updatedItem = yield prisma_1.prisma.inventoryItem.update({
            where: { id },
            data: {
                name: name || undefined,
                description: description !== undefined ? description : undefined,
                category: category || undefined,
                quantity: quantity !== undefined ? quantity : undefined,
                unit_price: unit_price !== undefined ? unit_price : undefined,
                status: status || undefined,
                supplier: supplier !== undefined ? supplier : undefined,
                location: location !== undefined ? location : undefined,
                serial_number: serial_number !== undefined ? serial_number : undefined,
                purchase_date: purchase_date ? new Date(purchase_date) : undefined,
                warranty_expiry: warranty_expiry ? new Date(warranty_expiry) : undefined,
                notes: notes !== undefined ? notes : undefined
            }
        });
        return res.json({
            message: 'Item de inventário atualizado com sucesso',
            item: updatedItem
        });
    }
    catch (error) {
        console.error('Erro ao atualizar item de inventário:', error);
        return res.status(500).json({ error: 'Erro ao atualizar item de inventário' });
    }
});
exports.updateInventoryItem = updateInventoryItem;
/**
 * Excluir um item de inventário
 * @route DELETE /api/inventory-items/:id
 */
const deleteInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o item existe
        const item = yield prisma_1.prisma.inventoryItem.findUnique({
            where: { id }
        });
        if (!item) {
            return res.status(404).json({ error: 'Item de inventário não encontrado' });
        }
        // Excluir item
        yield prisma_1.prisma.inventoryItem.delete({
            where: { id }
        });
        return res.json({ message: 'Item de inventário excluído com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir item de inventário:', error);
        return res.status(500).json({ error: 'Erro ao excluir item de inventário' });
    }
});
exports.deleteInventoryItem = deleteInventoryItem;
