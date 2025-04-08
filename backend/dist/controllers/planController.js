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
exports.getPlanCustomers = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlanById = exports.getAllPlans = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os planos
 */
const getAllPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Filtrar somente planos ativos se solicitado
        const onlyActive = req.query.active === 'true';
        // Construir objeto de busca
        let where = {};
        if (onlyActive) {
            where = { status: 'ACTIVE' };
        }
        // Verificar se o dashboard está solicitando sem paginação
        if (req.query.dashboard === 'true') {
            const plans = yield prisma_1.prisma.plan.findMany({
                where,
                orderBy: [
                    { status: 'asc' },
                    { price: 'asc' }
                ]
            });
            return res.json(plans);
        }
        const plans = yield prisma_1.prisma.plan.findMany({
            where,
            orderBy: [
                { status: 'asc' },
                { price: 'asc' }
            ]
        });
        return res.json(plans);
    }
    catch (error) {
        console.error('Erro ao buscar planos:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllPlans = getAllPlans;
/**
 * Obtém um plano específico
 */
const getPlanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const plan = yield prisma_1.prisma.plan.findUnique({
            where: { id }
        });
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        return res.json(plan);
    }
    catch (error) {
        console.error('Erro ao buscar plano:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getPlanById = getPlanById;
/**
 * Cria um novo plano
 */
const createPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, download, upload, data_limit, status } = req.body;
        // Validações básicas
        if (!name || !price) {
            return res.status(400).json({
                message: 'Nome e preço são obrigatórios'
            });
        }
        // Verifica se já existe um plano com este nome
        const existingPlan = yield prisma_1.prisma.plan.findFirst({
            where: { name }
        });
        if (existingPlan) {
            return res.status(400).json({
                message: 'Já existe um plano com este nome'
            });
        }
        // Cria o plano
        const plan = yield prisma_1.prisma.plan.create({
            data: {
                name,
                description,
                price: Number(price),
                download: Number(download) || 10,
                upload: Number(upload) || 5,
                data_limit: data_limit ? Number(data_limit) : null,
                status: status || 'ACTIVE'
            }
        });
        return res.status(201).json({
            message: 'Plano criado com sucesso',
            plan
        });
    }
    catch (error) {
        console.error('Erro ao criar plano:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createPlan = createPlan;
/**
 * Atualiza um plano existente
 */
const updatePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, price, download, upload, data_limit, status } = req.body;
        // Verifica se o plano existe
        const plan = yield prisma_1.prisma.plan.findUnique({
            where: { id }
        });
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        // Verifica se há outro plano com o mesmo nome (exceto este)
        if (name && name !== plan.name) {
            const nameExists = yield prisma_1.prisma.plan.findFirst({
                where: {
                    name,
                    id: { not: id }
                }
            });
            if (nameExists) {
                return res.status(400).json({ message: 'Já existe um plano com este nome' });
            }
        }
        // Atualiza o plano
        const updatedPlan = yield prisma_1.prisma.plan.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                price: price !== undefined ? Number(price) : undefined,
                download: download !== undefined ? Number(download) : undefined,
                upload: upload !== undefined ? Number(upload) : undefined,
                data_limit: data_limit !== undefined ? (data_limit ? Number(data_limit) : null) : undefined,
                status: status !== undefined ? status : undefined
            }
        });
        return res.json({
            message: 'Plano atualizado com sucesso',
            plan: updatedPlan
        });
    }
    catch (error) {
        console.error('Erro ao atualizar plano:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updatePlan = updatePlan;
/**
 * Exclui um plano
 */
const deletePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verifica se o plano existe
        const plan = yield prisma_1.prisma.plan.findUnique({
            where: { id }
        });
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        // Verifica se há clientes usando este plano
        const customerCount = yield prisma_1.prisma.customer.count({
            where: { planId: id }
        });
        if (customerCount > 0) {
            return res.status(400).json({
                message: `Não é possível excluir este plano pois há ${customerCount} cliente(s) utilizando-o`
            });
        }
        // Exclui o plano
        yield prisma_1.prisma.plan.delete({
            where: { id }
        });
        return res.json({ message: 'Plano excluído com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir plano:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deletePlan = deletePlan;
/**
 * Obtém clientes de um plano específico
 */
const getPlanCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verifica se o plano existe
        const plan = yield prisma_1.prisma.plan.findUnique({
            where: { id }
        });
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }
        // Busca paginada de clientes
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Busca os clientes do plano
        const [customers, total] = yield Promise.all([
            prisma_1.prisma.customer.findMany({
                where: { planId: id },
                skip,
                take: limit,
                orderBy: { full_name: 'asc' },
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                    status: true
                }
            }),
            prisma_1.prisma.customer.count({
                where: { planId: id }
            })
        ]);
        return res.json({
            plan: {
                id: plan.id,
                name: plan.name,
                price: plan.price
            },
            customers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar clientes do plano:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getPlanCustomers = getPlanCustomers;
