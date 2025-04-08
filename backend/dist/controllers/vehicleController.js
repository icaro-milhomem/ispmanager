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
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicleById = exports.getAllVehicles = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os veículos
 */
const getAllVehicles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Busca filtrada
        const status = req.query.status;
        const where = status ? { status } : {};
        // Buscar veículos com paginação
        const [vehicles, total] = yield Promise.all([
            prisma_1.prisma.vehicle.findMany({
                where,
                orderBy: [
                    { status: 'asc' },
                    { plate: 'asc' }
                ],
                skip,
                take: limit
            }),
            prisma_1.prisma.vehicle.count({ where })
        ]);
        return res.json({
            vehicles,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar veículos:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllVehicles = getAllVehicles;
/**
 * Obtém um veículo por ID
 */
const getVehicleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const vehicle = yield prisma_1.prisma.vehicle.findUnique({
            where: { id }
        });
        if (!vehicle) {
            return res.status(404).json({ message: 'Veículo não encontrado' });
        }
        return res.json(vehicle);
    }
    catch (error) {
        console.error('Erro ao buscar veículo:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getVehicleById = getVehicleById;
/**
 * Cria um novo veículo
 */
const createVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { plate, model, brand, year, type, status, mileage, fuel_type, driver_id, notes } = req.body;
        // Validação básica
        if (!plate || !model || !brand || !year || !fuel_type) {
            return res.status(400).json({
                message: 'Placa, modelo, marca, ano e tipo de combustível são obrigatórios'
            });
        }
        // Verificar se já existe um veículo com esta placa
        const existingVehicle = yield prisma_1.prisma.vehicle.findFirst({
            where: { plate }
        });
        if (existingVehicle) {
            return res.status(400).json({
                message: 'Já existe um veículo com esta placa'
            });
        }
        // Criar veículo
        const vehicle = yield prisma_1.prisma.vehicle.create({
            data: {
                plate,
                model,
                brand,
                year: Number(year),
                type: type || 'car',
                status: status || 'active',
                mileage: mileage ? Number(mileage) : 0,
                fuel_type,
                driver_id,
                notes
            }
        });
        return res.status(201).json({
            message: 'Veículo criado com sucesso',
            vehicle
        });
    }
    catch (error) {
        console.error('Erro ao criar veículo:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createVehicle = createVehicle;
/**
 * Atualiza um veículo
 */
const updateVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { plate, model, brand, year, type, status, mileage, fuel_type, driver_id, notes } = req.body;
        // Verificar se o veículo existe
        const vehicle = yield prisma_1.prisma.vehicle.findUnique({
            where: { id }
        });
        if (!vehicle) {
            return res.status(404).json({ message: 'Veículo não encontrado' });
        }
        // Verificar se a placa já existe (se ela foi alterada)
        if (plate && plate !== vehicle.plate) {
            const plateExists = yield prisma_1.prisma.vehicle.findFirst({
                where: {
                    plate,
                    id: { not: id }
                }
            });
            if (plateExists) {
                return res.status(400).json({ message: 'Já existe um veículo com esta placa' });
            }
        }
        // Atualizar dados
        const updatedVehicle = yield prisma_1.prisma.vehicle.update({
            where: { id },
            data: {
                plate: plate || undefined,
                model: model || undefined,
                brand: brand || undefined,
                year: year ? Number(year) : undefined,
                type: type || undefined,
                status: status || undefined,
                mileage: mileage ? Number(mileage) : undefined,
                fuel_type: fuel_type || undefined,
                driver_id: driver_id || undefined,
                notes: notes !== undefined ? notes : undefined
            }
        });
        return res.json({
            message: 'Veículo atualizado com sucesso',
            vehicle: updatedVehicle
        });
    }
    catch (error) {
        console.error('Erro ao atualizar veículo:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateVehicle = updateVehicle;
/**
 * Remove um veículo
 */
const deleteVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o veículo existe
        const vehicle = yield prisma_1.prisma.vehicle.findUnique({
            where: { id }
        });
        if (!vehicle) {
            return res.status(404).json({ message: 'Veículo não encontrado' });
        }
        // TODO: Verificar se há registros dependentes (abastecimentos, etc.)
        // Remover veículo
        yield prisma_1.prisma.vehicle.delete({
            where: { id }
        });
        return res.json({ message: 'Veículo removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover veículo:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteVehicle = deleteVehicle;
