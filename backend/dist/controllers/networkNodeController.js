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
exports.deleteNetworkNode = exports.updateNetworkNode = exports.createNetworkNode = exports.getNetworkNodeById = exports.getAllNetworkNodes = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os nós de rede
 */
const getAllNetworkNodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtros
        const status = req.query.status;
        const type = req.query.type;
        const search = req.query.search;
        // Construir o objeto where com base nos filtros
        const where = {};
        if (status) {
            // Converter status para maiúsculo se for 'active'
            where.status = status === 'active' ? 'ACTIVE' : status;
        }
        if (type)
            where.type = type;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { ip_address: { contains: search, mode: 'insensitive' } },
                { mac_address: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } }
            ];
        }
        // Buscar nós de rede com paginação
        const [nodes, total] = yield Promise.all([
            prisma_1.prisma.networkNode.findMany({
                where,
                orderBy: [
                    { name: 'asc' }
                ],
                skip,
                take: limit
            }),
            prisma_1.prisma.networkNode.count({ where })
        ]);
        // Verificar se o dashboard está solicitando sem paginação
        if (req.query.dashboard === 'true') {
            return res.json(nodes);
        }
        return res.json({
            nodes,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar nós de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllNetworkNodes = getAllNetworkNodes;
/**
 * Obtém um nó de rede por ID
 */
const getNetworkNodeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const node = yield prisma_1.prisma.networkNode.findUnique({
            where: { id }
        });
        if (!node) {
            return res.status(404).json({ message: 'Nó de rede não encontrado' });
        }
        return res.json(node);
    }
    catch (error) {
        console.error('Erro ao buscar nó de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getNetworkNodeById = getNetworkNodeById;
/**
 * Cria um novo nó de rede
 */
const createNetworkNode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, ip_address, mac_address, location, status, notes } = req.body;
        // Validação básica
        if (!name || !type || !ip_address) {
            return res.status(400).json({
                message: 'Nome, tipo e endereço IP são obrigatórios'
            });
        }
        // Verificar se já existe um nó com este IP
        const existingNode = yield prisma_1.prisma.networkNode.findFirst({
            where: { ip_address }
        });
        if (existingNode) {
            return res.status(400).json({
                message: 'Já existe um nó de rede com este endereço IP'
            });
        }
        // Criar nó de rede
        const node = yield prisma_1.prisma.networkNode.create({
            data: {
                name,
                type,
                ip_address,
                mac_address,
                location,
                status: status || 'ACTIVE',
                notes
            }
        });
        return res.status(201).json({
            message: 'Nó de rede criado com sucesso',
            node
        });
    }
    catch (error) {
        console.error('Erro ao criar nó de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createNetworkNode = createNetworkNode;
/**
 * Atualiza um nó de rede
 */
const updateNetworkNode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, type, ip_address, mac_address, location, status, notes } = req.body;
        // Verificar se o nó existe
        const node = yield prisma_1.prisma.networkNode.findUnique({
            where: { id }
        });
        if (!node) {
            return res.status(404).json({ message: 'Nó de rede não encontrado' });
        }
        // Verificar se o IP já existe (se foi alterado)
        if (ip_address && ip_address !== node.ip_address) {
            const ipExists = yield prisma_1.prisma.networkNode.findFirst({
                where: {
                    ip_address,
                    id: { not: id }
                }
            });
            if (ipExists) {
                return res.status(400).json({ message: 'Já existe um nó de rede com este endereço IP' });
            }
        }
        // Atualizar dados
        const updatedNode = yield prisma_1.prisma.networkNode.update({
            where: { id },
            data: {
                name: name || undefined,
                type: type || undefined,
                ip_address: ip_address || undefined,
                mac_address: mac_address !== undefined ? mac_address : undefined,
                location: location !== undefined ? location : undefined,
                status: status || undefined,
                notes: notes !== undefined ? notes : undefined
            }
        });
        return res.json({
            message: 'Nó de rede atualizado com sucesso',
            node: updatedNode
        });
    }
    catch (error) {
        console.error('Erro ao atualizar nó de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateNetworkNode = updateNetworkNode;
/**
 * Remove um nó de rede
 */
const deleteNetworkNode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o nó existe
        const node = yield prisma_1.prisma.networkNode.findUnique({
            where: { id }
        });
        if (!node) {
            return res.status(404).json({ message: 'Nó de rede não encontrado' });
        }
        // Remover nó de rede
        yield prisma_1.prisma.networkNode.delete({
            where: { id }
        });
        return res.json({ message: 'Nó de rede removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover nó de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteNetworkNode = deleteNetworkNode;
