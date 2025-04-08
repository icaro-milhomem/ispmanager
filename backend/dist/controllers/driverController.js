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
exports.deleteDriver = exports.updateDriver = exports.createDriver = exports.getDriverById = exports.getAllDrivers = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os motoristas
 */
const getAllDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Busca filtrada
        const status = req.query.status;
        const where = status ? { status } : {};
        // Buscar motoristas com paginação
        const [drivers, total] = yield Promise.all([
            prisma_1.prisma.driver.findMany({
                where,
                orderBy: [
                    { name: 'asc' }
                ],
                skip,
                take: limit
            }),
            prisma_1.prisma.driver.count({ where })
        ]);
        return res.json({
            drivers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllDrivers = getAllDrivers;
/**
 * Obtém um motorista por ID
 */
const getDriverById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const driver = yield prisma_1.prisma.driver.findUnique({
            where: { id }
        });
        if (!driver) {
            return res.status(404).json({ message: 'Motorista não encontrado' });
        }
        return res.json(driver);
    }
    catch (error) {
        console.error('Erro ao buscar motorista:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getDriverById = getDriverById;
/**
 * Cria um novo motorista
 */
const createDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, document, license_number, license_category, license_expiry, phone, address, status, notes } = req.body;
        // Validação básica
        if (!name || !document || !license_number || !license_category || !license_expiry) {
            return res.status(400).json({
                message: 'Nome, documento, número da CNH, categoria da CNH e data de validade são obrigatórios'
            });
        }
        // Verificar se já existe um motorista com este documento ou número de CNH
        const existingDriver = yield prisma_1.prisma.driver.findFirst({
            where: {
                OR: [
                    { document },
                    { license_number }
                ]
            }
        });
        if (existingDriver) {
            return res.status(400).json({
                message: 'Já existe um motorista com este documento ou número de CNH'
            });
        }
        // Criar motorista
        const driver = yield prisma_1.prisma.driver.create({
            data: {
                name,
                document,
                license_number,
                license_category,
                license_expiry: new Date(license_expiry),
                phone,
                address,
                status: status || 'active',
                notes
            }
        });
        return res.status(201).json({
            message: 'Motorista criado com sucesso',
            driver
        });
    }
    catch (error) {
        console.error('Erro ao criar motorista:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createDriver = createDriver;
/**
 * Atualiza um motorista
 */
const updateDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, document, license_number, license_category, license_expiry, phone, address, status, notes } = req.body;
        // Verificar se o motorista existe
        const driver = yield prisma_1.prisma.driver.findUnique({
            where: { id }
        });
        if (!driver) {
            return res.status(404).json({ message: 'Motorista não encontrado' });
        }
        // Verificar se o documento ou CNH já existem (se foram alterados)
        if ((document && document !== driver.document) ||
            (license_number && license_number !== driver.license_number)) {
            const driverExists = yield prisma_1.prisma.driver.findFirst({
                where: {
                    OR: [
                        { document: document || '' },
                        { license_number: license_number || '' }
                    ],
                    id: { not: id }
                }
            });
            if (driverExists) {
                return res.status(400).json({
                    message: 'Já existe um motorista com este documento ou número de CNH'
                });
            }
        }
        // Atualizar dados
        const updatedDriver = yield prisma_1.prisma.driver.update({
            where: { id },
            data: {
                name: name || undefined,
                document: document || undefined,
                license_number: license_number || undefined,
                license_category: license_category || undefined,
                license_expiry: license_expiry ? new Date(license_expiry) : undefined,
                phone: phone !== undefined ? phone : undefined,
                address: address !== undefined ? address : undefined,
                status: status || undefined,
                notes: notes !== undefined ? notes : undefined
            }
        });
        return res.json({
            message: 'Motorista atualizado com sucesso',
            driver: updatedDriver
        });
    }
    catch (error) {
        console.error('Erro ao atualizar motorista:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateDriver = updateDriver;
/**
 * Remove um motorista
 */
const deleteDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o motorista existe
        const driver = yield prisma_1.prisma.driver.findUnique({
            where: { id }
        });
        if (!driver) {
            return res.status(404).json({ message: 'Motorista não encontrado' });
        }
        // TODO: Verificar se há veículos associados a este motorista
        // Remover motorista
        yield prisma_1.prisma.driver.delete({
            where: { id }
        });
        return res.json({ message: 'Motorista removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover motorista:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteDriver = deleteDriver;
