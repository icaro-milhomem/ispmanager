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
exports.deleteFuelRefill = exports.updateFuelRefill = exports.createFuelRefill = exports.getFuelRefillById = exports.getAllFuelRefills = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os abastecimentos
 */
const getAllFuelRefills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[FuelRefillController] Recebendo requisição para listar abastecimentos');
        console.log('[FuelRefillController] Query params:', req.query);
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtros
        const vehicleId = req.query.vehicleId;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        // Construir o objeto where com base nos filtros
        const where = {};
        if (vehicleId)
            where.vehicle_id = vehicleId;
        if (fromDate && toDate) {
            where.date = {
                gte: new Date(fromDate),
                lte: new Date(toDate)
            };
        }
        else if (fromDate) {
            where.date = { gte: new Date(fromDate) };
        }
        else if (toDate) {
            where.date = { lte: new Date(toDate) };
        }
        console.log('[FuelRefillController] Filtros aplicados:', where);
        try {
            // Buscar abastecimentos com paginação
            const [refills, total] = yield Promise.all([
                prisma_1.prisma.fuelRefill.findMany({
                    where,
                    orderBy: [
                        { date: 'desc' }
                    ],
                    include: {
                        vehicle: {
                            select: {
                                id: true,
                                plate: true,
                                model: true,
                                brand: true
                            }
                        }
                    },
                    skip,
                    take: limit
                }),
                prisma_1.prisma.fuelRefill.count({ where })
            ]);
            console.log(`[FuelRefillController] Encontrados ${refills.length} abastecimentos de um total de ${total}`);
            // Verificando se há dados disponíveis
            if (refills.length === 0) {
                console.log('[FuelRefillController] Nenhum abastecimento encontrado, verificando se existem registros na tabela');
                // Verificar se há algum registro na tabela
                const anyRecord = yield prisma_1.prisma.fuelRefill.findFirst();
                if (!anyRecord) {
                    console.log('[FuelRefillController] Tabela vazia, retornando array vazio com aviso');
                }
            }
            const response = {
                refills,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
            console.log('[FuelRefillController] Enviando resposta com dados de abastecimentos');
            return res.json(response);
        }
        catch (dbError) {
            console.error('[FuelRefillController] Erro do banco de dados:', dbError);
            // Verificar se é um erro de conexão ou de tabela inexistente
            if (dbError.code === 'P2021') {
                console.error('[FuelRefillController] Tabela não encontrada');
                return res.status(500).json({
                    message: 'Erro interno do servidor: tabela de abastecimentos não encontrada',
                    error: 'Table not found'
                });
            }
            if (dbError.code === 'P1001') {
                console.error('[FuelRefillController] Erro de conexão com o banco de dados');
                return res.status(500).json({
                    message: 'Erro de conexão com o banco de dados',
                    error: 'Database connection error'
                });
            }
            throw dbError;
        }
    }
    catch (error) {
        console.error('Erro ao buscar abastecimentos:', error);
        return res.status(500).json({
            message: 'Erro interno do servidor',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.getAllFuelRefills = getAllFuelRefills;
/**
 * Obtém um abastecimento por ID
 */
const getFuelRefillById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const refill = yield prisma_1.prisma.fuelRefill.findUnique({
            where: { id },
            include: {
                vehicle: {
                    select: {
                        id: true,
                        plate: true,
                        model: true,
                        brand: true,
                        fuel_type: true
                    }
                }
            }
        });
        if (!refill) {
            return res.status(404).json({ message: 'Abastecimento não encontrado' });
        }
        return res.json(refill);
    }
    catch (error) {
        console.error('Erro ao buscar abastecimento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getFuelRefillById = getFuelRefillById;
/**
 * Cria um novo abastecimento
 */
const createFuelRefill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vehicle_id, date, amount_liters, price_per_liter, total_price, mileage, fuel_type, gas_station, notes } = req.body;
        // Validação básica
        if (!vehicle_id || !date || !amount_liters || !price_per_liter || !mileage) {
            return res.status(400).json({
                message: 'Veículo, data, quantidade de litros, preço por litro e quilometragem são obrigatórios'
            });
        }
        // Verificar se o veículo existe
        const vehicle = yield prisma_1.prisma.vehicle.findUnique({
            where: { id: vehicle_id }
        });
        if (!vehicle) {
            return res.status(404).json({ message: 'Veículo não encontrado' });
        }
        // Calcular o valor total se não foi informado
        const calculatedTotalPrice = total_price || (amount_liters * price_per_liter);
        // Criar abastecimento
        const refill = yield prisma_1.prisma.fuelRefill.create({
            data: {
                vehicle_id,
                date: new Date(date),
                amount_liters: Number(amount_liters),
                price_per_liter: Number(price_per_liter),
                total_price: Number(calculatedTotalPrice),
                mileage: Number(mileage),
                fuel_type: fuel_type || vehicle.fuel_type,
                gas_station,
                notes
            },
            include: {
                vehicle: {
                    select: {
                        plate: true,
                        model: true
                    }
                }
            }
        });
        // Atualizar a quilometragem do veículo se necessário
        if (vehicle.mileage < Number(mileage)) {
            yield prisma_1.prisma.vehicle.update({
                where: { id: vehicle_id },
                data: { mileage: Number(mileage) }
            });
        }
        return res.status(201).json({
            message: 'Abastecimento registrado com sucesso',
            refill
        });
    }
    catch (error) {
        console.error('Erro ao registrar abastecimento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createFuelRefill = createFuelRefill;
/**
 * Atualiza um abastecimento
 */
const updateFuelRefill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { vehicle_id, date, amount_liters, price_per_liter, total_price, mileage, fuel_type, gas_station, notes } = req.body;
        // Verificar se o abastecimento existe
        const refill = yield prisma_1.prisma.fuelRefill.findUnique({
            where: { id }
        });
        if (!refill) {
            return res.status(404).json({ message: 'Abastecimento não encontrado' });
        }
        // Verificar se o veículo existe (se foi alterado)
        if (vehicle_id && vehicle_id !== refill.vehicle_id) {
            const vehicle = yield prisma_1.prisma.vehicle.findUnique({
                where: { id: vehicle_id }
            });
            if (!vehicle) {
                return res.status(404).json({ message: 'Veículo não encontrado' });
            }
        }
        // Calcular o valor total se preço ou quantidade foram alterados
        let newTotalPrice = total_price;
        if (amount_liters && price_per_liter) {
            newTotalPrice = Number(amount_liters) * Number(price_per_liter);
        }
        else if (amount_liters && !price_per_liter && !total_price) {
            newTotalPrice = Number(amount_liters) * refill.price_per_liter;
        }
        else if (!amount_liters && price_per_liter && !total_price) {
            newTotalPrice = refill.amount_liters * Number(price_per_liter);
        }
        // Atualizar dados
        const updatedRefill = yield prisma_1.prisma.fuelRefill.update({
            where: { id },
            data: {
                vehicle_id: vehicle_id || undefined,
                date: date ? new Date(date) : undefined,
                amount_liters: amount_liters ? Number(amount_liters) : undefined,
                price_per_liter: price_per_liter ? Number(price_per_liter) : undefined,
                total_price: newTotalPrice !== undefined ? Number(newTotalPrice) : undefined,
                mileage: mileage ? Number(mileage) : undefined,
                fuel_type: fuel_type || undefined,
                gas_station: gas_station !== undefined ? gas_station : undefined,
                notes: notes !== undefined ? notes : undefined
            },
            include: {
                vehicle: {
                    select: {
                        plate: true,
                        model: true,
                        mileage: true
                    }
                }
            }
        });
        // Atualizar a quilometragem do veículo se necessário
        if (mileage && updatedRefill.vehicle && updatedRefill.vehicle.mileage < Number(mileage)) {
            yield prisma_1.prisma.vehicle.update({
                where: { id: updatedRefill.vehicle_id },
                data: { mileage: Number(mileage) }
            });
        }
        return res.json({
            message: 'Abastecimento atualizado com sucesso',
            refill: updatedRefill
        });
    }
    catch (error) {
        console.error('Erro ao atualizar abastecimento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateFuelRefill = updateFuelRefill;
/**
 * Remove um abastecimento
 */
const deleteFuelRefill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o abastecimento existe
        const refill = yield prisma_1.prisma.fuelRefill.findUnique({
            where: { id }
        });
        if (!refill) {
            return res.status(404).json({ message: 'Abastecimento não encontrado' });
        }
        // Remover abastecimento
        yield prisma_1.prisma.fuelRefill.delete({
            where: { id }
        });
        return res.json({ message: 'Abastecimento removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover abastecimento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteFuelRefill = deleteFuelRefill;
