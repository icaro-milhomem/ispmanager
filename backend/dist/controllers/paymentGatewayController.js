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
exports.deletePaymentGateway = exports.updatePaymentGateway = exports.createPaymentGateway = exports.getPaymentGatewayById = exports.getAllPaymentGateways = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os gateways de pagamento
 */
const getAllPaymentGateways = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtro pelo status ativo
        const is_active = req.query.active === 'true' ? true :
            req.query.active === 'false' ? false :
                undefined;
        const where = is_active !== undefined ? { is_active } : {};
        // Buscar gateways com paginação
        const [gateways, total] = yield Promise.all([
            prisma_1.prisma.paymentGateway.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma_1.prisma.paymentGateway.count({ where })
        ]);
        // Mascarar informações sensíveis
        const maskedGateways = gateways.map((gateway) => (Object.assign(Object.assign({}, gateway), { api_key: gateway.api_key ? '********' : null, api_secret: gateway.api_secret ? '********' : null })));
        return res.json({
            data: maskedGateways,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar gateways de pagamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllPaymentGateways = getAllPaymentGateways;
/**
 * Obtém um gateway de pagamento por ID
 */
const getPaymentGatewayById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const gateway = yield prisma_1.prisma.paymentGateway.findUnique({
            where: { id }
        });
        if (!gateway) {
            return res.status(404).json({ message: 'Gateway de pagamento não encontrado' });
        }
        // Mascarar informações sensíveis
        const maskedGateway = Object.assign(Object.assign({}, gateway), { api_key: gateway.api_key ? '********' : null, api_secret: gateway.api_secret ? '********' : null });
        return res.json(maskedGateway);
    }
    catch (error) {
        console.error('Erro ao buscar gateway de pagamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getPaymentGatewayById = getPaymentGatewayById;
/**
 * Cria um novo gateway de pagamento
 */
const createPaymentGateway = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, provider, api_key, api_secret, is_active, sandbox_mode, webhook_url, return_url, supported_methods, notes } = req.body;
        // Validar campos obrigatórios
        if (!name || !provider) {
            return res.status(400).json({
                message: 'Nome e provedor são campos obrigatórios'
            });
        }
        // Verificar se já existe um gateway com o mesmo nome
        const existingGateway = yield prisma_1.prisma.paymentGateway.findFirst({
            where: { name }
        });
        if (existingGateway) {
            return res.status(400).json({
                message: 'Já existe um gateway de pagamento com este nome'
            });
        }
        // Criar o gateway
        const gateway = yield prisma_1.prisma.paymentGateway.create({
            data: {
                name,
                provider,
                api_key,
                api_secret,
                is_active: is_active !== undefined ? is_active : true,
                sandbox_mode: sandbox_mode !== undefined ? sandbox_mode : false,
                webhook_url,
                return_url,
                supported_methods,
                notes
            }
        });
        return res.status(201).json({
            message: 'Gateway de pagamento criado com sucesso',
            id: gateway.id
        });
    }
    catch (error) {
        console.error('Erro ao criar gateway de pagamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createPaymentGateway = createPaymentGateway;
/**
 * Atualiza um gateway de pagamento
 */
const updatePaymentGateway = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, provider, api_key, api_secret, is_active, sandbox_mode, webhook_url, return_url, supported_methods, notes } = req.body;
        // Verificar se o gateway existe
        const existingGateway = yield prisma_1.prisma.paymentGateway.findUnique({
            where: { id }
        });
        if (!existingGateway) {
            return res.status(404).json({ message: 'Gateway de pagamento não encontrado' });
        }
        // Verificar se existe outro gateway com o mesmo nome (excluindo o atual)
        if (name && name !== existingGateway.name) {
            const duplicateGateway = yield prisma_1.prisma.paymentGateway.findFirst({
                where: {
                    name,
                    id: { not: id }
                }
            });
            if (duplicateGateway) {
                return res.status(400).json({
                    message: 'Já existe outro gateway de pagamento com este nome'
                });
            }
        }
        // Atualizar o gateway
        const gateway = yield prisma_1.prisma.paymentGateway.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                provider: provider !== undefined ? provider : undefined,
                api_key: api_key !== undefined ? api_key : undefined,
                api_secret: api_secret !== undefined ? api_secret : undefined,
                is_active: is_active !== undefined ? is_active : undefined,
                sandbox_mode: sandbox_mode !== undefined ? sandbox_mode : undefined,
                webhook_url: webhook_url !== undefined ? webhook_url : undefined,
                return_url: return_url !== undefined ? return_url : undefined,
                supported_methods: supported_methods !== undefined ? supported_methods : undefined,
                notes: notes !== undefined ? notes : undefined
            }
        });
        return res.json({
            message: 'Gateway de pagamento atualizado com sucesso',
            id: gateway.id
        });
    }
    catch (error) {
        console.error('Erro ao atualizar gateway de pagamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updatePaymentGateway = updatePaymentGateway;
/**
 * Remove um gateway de pagamento
 */
const deletePaymentGateway = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o gateway existe
        const existingGateway = yield prisma_1.prisma.paymentGateway.findUnique({
            where: { id }
        });
        if (!existingGateway) {
            return res.status(404).json({ message: 'Gateway de pagamento não encontrado' });
        }
        // Deletar o gateway
        yield prisma_1.prisma.paymentGateway.delete({
            where: { id }
        });
        return res.json({ message: 'Gateway de pagamento removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar gateway de pagamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deletePaymentGateway = deletePaymentGateway;
