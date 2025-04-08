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
exports.deleteEquipment = exports.updateEquipment = exports.createEquipment = exports.getEquipmentById = exports.getAllEquipments = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os equipamentos
 */
const getAllEquipments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtros
        const status = req.query.status;
        const brand = req.query.brand;
        // Construir o objeto where com base nos filtros
        const where = {};
        if (status)
            where.status = status;
        if (brand)
            where.brand = brand;
        // Buscar equipamentos com paginação
        const [equipments, total] = yield Promise.all([
            prisma_1.prisma.equipment.findMany({
                where,
                orderBy: [
                    { createdAt: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma_1.prisma.equipment.count({ where })
        ]);
        return res.json({
            equipments,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllEquipments = getAllEquipments;
/**
 * Obtém um equipamento por ID
 */
const getEquipmentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const equipment = yield prisma_1.prisma.equipment.findUnique({
            where: { id }
        });
        if (!equipment) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        return res.json(equipment);
    }
    catch (error) {
        console.error('Erro ao buscar equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getEquipmentById = getEquipmentById;
/**
 * Cria um novo equipamento
 */
const createEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, brand, model, serial, status, location, notes } = req.body;
        // Validação básica
        if (!name || !brand || !model) {
            return res.status(400).json({
                message: 'Nome, marca e modelo são obrigatórios'
            });
        }
        // Verificar se o serial já existe (se foi informado)
        if (serial) {
            const existingEquipment = yield prisma_1.prisma.equipment.findFirst({
                where: { serial }
            });
            if (existingEquipment) {
                return res.status(400).json({
                    message: 'Já existe um equipamento com este número de série'
                });
            }
        }
        // Criar equipamento
        const equipment = yield prisma_1.prisma.equipment.create({
            data: {
                name,
                brand,
                model,
                serial,
                status: status || 'AVAILABLE',
                location,
                notes
            }
        });
        return res.status(201).json({
            message: 'Equipamento criado com sucesso',
            equipment
        });
    }
    catch (error) {
        console.error('Erro ao criar equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createEquipment = createEquipment;
/**
 * Atualiza um equipamento
 */
const updateEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, brand, model, serial, status, location, notes } = req.body;
        // Verificar se o equipamento existe
        const equipment = yield prisma_1.prisma.equipment.findUnique({
            where: { id }
        });
        if (!equipment) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        // Verificar se o serial já existe (se foi alterado)
        if (serial && serial !== equipment.serial) {
            const serialExists = yield prisma_1.prisma.equipment.findFirst({
                where: {
                    serial,
                    id: { not: id }
                }
            });
            if (serialExists) {
                return res.status(400).json({ message: 'Já existe um equipamento com este número de série' });
            }
        }
        // Atualizar dados
        const updatedEquipment = yield prisma_1.prisma.equipment.update({
            where: { id },
            data: {
                name: name || undefined,
                brand: brand || undefined,
                model: model || undefined,
                serial: serial !== undefined ? serial : undefined,
                status: status || undefined,
                location: location !== undefined ? location : undefined,
                notes: notes !== undefined ? notes : undefined
            }
        });
        return res.json({
            message: 'Equipamento atualizado com sucesso',
            equipment: updatedEquipment
        });
    }
    catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateEquipment = updateEquipment;
/**
 * Remove um equipamento
 */
const deleteEquipment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o equipamento existe
        const equipment = yield prisma_1.prisma.equipment.findUnique({
            where: { id }
        });
        if (!equipment) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        // Remover equipamento
        yield prisma_1.prisma.equipment.delete({
            where: { id }
        });
        return res.json({ message: 'Equipamento removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteEquipment = deleteEquipment;
