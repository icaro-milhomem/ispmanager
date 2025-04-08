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
exports.deleteMileageLog = exports.updateMileageLog = exports.createMileageLog = exports.getMileageLogById = exports.getAllMileageLogs = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os registros de quilometragem com paginação e filtros
 */
const getAllMileageLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, vehicleId, startDate, endDate } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        // Construir condições de filtro
        const where = {};
        if (vehicleId) {
            where.vehicle_id = String(vehicleId);
        }
        // Filtro por período
        if (startDate && endDate) {
            where.date = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate))
            };
        }
        else if (startDate) {
            where.date = { gte: new Date(String(startDate)) };
        }
        else if (endDate) {
            where.date = { lte: new Date(String(endDate)) };
        }
        // Realizar consulta com filtros e paginação
        const [mileageLogs, total] = yield Promise.all([
            prisma_1.prisma.mileageLog.findMany({
                where,
                include: { vehicle: true },
                skip,
                take: limitNumber,
                orderBy: { date: 'desc' }
            }),
            prisma_1.prisma.mileageLog.count({ where })
        ]);
        // Calcular metadados de paginação
        const totalPages = Math.ceil(total / limitNumber);
        return res.status(200).json({
            data: mileageLogs,
            meta: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar registros de quilometragem:', error);
        return res.status(500).json({
            message: 'Erro ao buscar registros de quilometragem',
            error: error.message
        });
    }
});
exports.getAllMileageLogs = getAllMileageLogs;
/**
 * Obtém um registro de quilometragem por ID
 */
const getMileageLogById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const mileageLog = yield prisma_1.prisma.mileageLog.findUnique({
            where: { id },
            include: { vehicle: true }
        });
        if (!mileageLog) {
            return res.status(404).json({ message: 'Registro de quilometragem não encontrado' });
        }
        return res.status(200).json(mileageLog);
    }
    catch (error) {
        console.error('Erro ao buscar registro de quilometragem:', error);
        return res.status(500).json({
            message: 'Erro ao buscar registro de quilometragem',
            error: error.message
        });
    }
});
exports.getMileageLogById = getMileageLogById;
/**
 * Cria um novo registro de quilometragem
 */
const createMileageLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vehicle_id, date, initial_mileage, final_mileage, purpose, notes } = req.body;
        // Validar campos obrigatórios
        if (!vehicle_id || !date || initial_mileage === undefined || final_mileage === undefined || !purpose) {
            return res.status(400).json({
                message: 'Campos obrigatórios: vehicle_id, date, initial_mileage, final_mileage, purpose'
            });
        }
        // Converter valores para números
        const initialMileage = Number(initial_mileage);
        const finalMileage = Number(final_mileage);
        // Validar valores de quilometragem
        if (isNaN(initialMileage) || isNaN(finalMileage)) {
            return res.status(400).json({ message: 'Valores de quilometragem inválidos' });
        }
        if (initialMileage > finalMileage) {
            return res.status(400).json({
                message: 'A quilometragem final deve ser maior ou igual à quilometragem inicial'
            });
        }
        // Calcular a distância percorrida
        const distance = finalMileage - initialMileage;
        // Verificar se o veículo existe
        const vehicle = yield prisma_1.prisma.vehicle.findUnique({
            where: { id: vehicle_id }
        });
        if (!vehicle) {
            return res.status(404).json({ message: 'Veículo não encontrado' });
        }
        // Criar o registro de quilometragem
        const mileageLog = yield prisma_1.prisma.mileageLog.create({
            data: {
                vehicle_id,
                date: new Date(date),
                initial_mileage: initialMileage,
                final_mileage: finalMileage,
                distance,
                purpose,
                notes
            }
        });
        // Atualizar a quilometragem do veículo se necessário
        if (finalMileage > vehicle.mileage) {
            yield prisma_1.prisma.vehicle.update({
                where: { id: vehicle_id },
                data: { mileage: finalMileage }
            });
        }
        return res.status(201).json({
            message: 'Registro de quilometragem criado com sucesso',
            data: mileageLog
        });
    }
    catch (error) {
        console.error('Erro ao criar registro de quilometragem:', error);
        return res.status(500).json({
            message: 'Erro ao criar registro de quilometragem',
            error: error.message
        });
    }
});
exports.createMileageLog = createMileageLog;
/**
 * Atualiza um registro de quilometragem
 */
const updateMileageLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { vehicle_id, date, initial_mileage, final_mileage, purpose, notes } = req.body;
        // Verificar se o registro existe
        const existingLog = yield prisma_1.prisma.mileageLog.findUnique({
            where: { id }
        });
        if (!existingLog) {
            return res.status(404).json({ message: 'Registro de quilometragem não encontrado' });
        }
        // Preparar dados para atualização
        const updateData = {};
        if (vehicle_id)
            updateData.vehicle_id = vehicle_id;
        if (date)
            updateData.date = new Date(date);
        if (purpose)
            updateData.purpose = purpose;
        if (notes !== undefined)
            updateData.notes = notes;
        // Validar e processar dados de quilometragem
        if (initial_mileage !== undefined || final_mileage !== undefined) {
            const initialMileage = initial_mileage !== undefined ? Number(initial_mileage) : existingLog.initial_mileage;
            const finalMileage = final_mileage !== undefined ? Number(final_mileage) : existingLog.final_mileage;
            // Validar valores
            if (isNaN(initialMileage) || isNaN(finalMileage)) {
                return res.status(400).json({ message: 'Valores de quilometragem inválidos' });
            }
            if (initialMileage > finalMileage) {
                return res.status(400).json({
                    message: 'A quilometragem final deve ser maior ou igual à quilometragem inicial'
                });
            }
            // Atualizar campos de quilometragem
            updateData.initial_mileage = initialMileage;
            updateData.final_mileage = finalMileage;
            updateData.distance = finalMileage - initialMileage;
            // Se o veículo foi alterado ou a quilometragem final foi aumentada, atualize o veículo
            if (vehicle_id || (finalMileage > existingLog.final_mileage)) {
                const vehicleId = vehicle_id || existingLog.vehicle_id;
                const vehicle = yield prisma_1.prisma.vehicle.findUnique({
                    where: { id: vehicleId }
                });
                if (vehicle && finalMileage > vehicle.mileage) {
                    yield prisma_1.prisma.vehicle.update({
                        where: { id: vehicleId },
                        data: { mileage: finalMileage }
                    });
                }
            }
        }
        // Atualizar o registro
        const updatedLog = yield prisma_1.prisma.mileageLog.update({
            where: { id },
            data: updateData,
            include: { vehicle: true }
        });
        // Verificar se a quilometragem final é maior que a do veículo e atualizar
        if (updatedLog.vehicle && updatedLog.final_mileage > updatedLog.vehicle.mileage) {
            yield prisma_1.prisma.vehicle.update({
                where: { id: updatedLog.vehicle_id },
                data: { mileage: updatedLog.final_mileage }
            });
        }
        return res.status(200).json({
            message: 'Registro de quilometragem atualizado com sucesso',
            data: updatedLog
        });
    }
    catch (error) {
        console.error('Erro ao atualizar registro de quilometragem:', error);
        return res.status(500).json({
            message: 'Erro ao atualizar registro de quilometragem',
            error: error.message
        });
    }
});
exports.updateMileageLog = updateMileageLog;
/**
 * Exclui um registro de quilometragem
 */
const deleteMileageLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o registro existe
        const existingLog = yield prisma_1.prisma.mileageLog.findUnique({
            where: { id }
        });
        if (!existingLog) {
            return res.status(404).json({ message: 'Registro de quilometragem não encontrado' });
        }
        // Excluir o registro
        yield prisma_1.prisma.mileageLog.delete({
            where: { id }
        });
        return res.status(200).json({
            message: 'Registro de quilometragem excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir registro de quilometragem:', error);
        return res.status(500).json({
            message: 'Erro ao excluir registro de quilometragem',
            error: error.message
        });
    }
});
exports.deleteMileageLog = deleteMileageLog;
