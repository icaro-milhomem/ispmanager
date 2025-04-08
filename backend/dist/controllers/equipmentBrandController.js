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
exports.deleteEquipmentBrand = exports.updateEquipmentBrand = exports.createEquipmentBrand = exports.getEquipmentBrandById = exports.getAllEquipmentBrands = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todas as marcas de equipamentos
 */
const getAllEquipmentBrands = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar todas as marcas
        const brands = yield prisma_1.prisma.equipmentBrand.findMany({
            orderBy: [
                { name: 'asc' }
            ]
        });
        return res.json(brands);
    }
    catch (error) {
        console.error('Erro ao buscar marcas de equipamentos:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllEquipmentBrands = getAllEquipmentBrands;
/**
 * Obtém uma marca de equipamento por ID
 */
const getEquipmentBrandById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const brand = yield prisma_1.prisma.equipmentBrand.findUnique({
            where: { id }
        });
        if (!brand) {
            return res.status(404).json({ message: 'Marca não encontrada' });
        }
        return res.json(brand);
    }
    catch (error) {
        console.error('Erro ao buscar marca de equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getEquipmentBrandById = getEquipmentBrandById;
/**
 * Cria uma nova marca de equipamento
 */
const createEquipmentBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, website } = req.body;
        // Validação básica
        if (!name) {
            return res.status(400).json({
                message: 'Nome da marca é obrigatório'
            });
        }
        // Verificar se já existe uma marca com este nome
        const existingBrand = yield prisma_1.prisma.equipmentBrand.findFirst({
            where: { name }
        });
        if (existingBrand) {
            return res.status(400).json({
                message: 'Já existe uma marca com este nome'
            });
        }
        // Criar marca
        const brand = yield prisma_1.prisma.equipmentBrand.create({
            data: {
                name,
                description,
                website
            }
        });
        return res.status(201).json({
            message: 'Marca criada com sucesso',
            brand
        });
    }
    catch (error) {
        console.error('Erro ao criar marca de equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createEquipmentBrand = createEquipmentBrand;
/**
 * Atualiza uma marca de equipamento
 */
const updateEquipmentBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, website } = req.body;
        // Verificar se a marca existe
        const brand = yield prisma_1.prisma.equipmentBrand.findUnique({
            where: { id }
        });
        if (!brand) {
            return res.status(404).json({ message: 'Marca não encontrada' });
        }
        // Verificar se o nome já existe (se ele foi alterado)
        if (name && name !== brand.name) {
            const nameExists = yield prisma_1.prisma.equipmentBrand.findFirst({
                where: {
                    name,
                    id: { not: id }
                }
            });
            if (nameExists) {
                return res.status(400).json({ message: 'Já existe uma marca com este nome' });
            }
        }
        // Atualizar dados
        const updatedBrand = yield prisma_1.prisma.equipmentBrand.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                website: website !== undefined ? website : undefined
            }
        });
        return res.json({
            message: 'Marca atualizada com sucesso',
            brand: updatedBrand
        });
    }
    catch (error) {
        console.error('Erro ao atualizar marca de equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateEquipmentBrand = updateEquipmentBrand;
/**
 * Remove uma marca de equipamento
 */
const deleteEquipmentBrand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se a marca existe
        const brand = yield prisma_1.prisma.equipmentBrand.findUnique({
            where: { id }
        });
        if (!brand) {
            return res.status(404).json({ message: 'Marca não encontrada' });
        }
        // TODO: Verificar se há equipamentos utilizando esta marca
        // Remover marca
        yield prisma_1.prisma.equipmentBrand.delete({
            where: { id }
        });
        return res.json({ message: 'Marca removida com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover marca de equipamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteEquipmentBrand = deleteEquipmentBrand;
