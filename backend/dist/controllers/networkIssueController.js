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
exports.deleteNetworkIssue = exports.updateNetworkIssue = exports.createNetworkIssue = exports.getNetworkIssueById = exports.getAllNetworkIssues = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os problemas de rede
 */
const getAllNetworkIssues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.query.status;
        const priority = req.query.priority;
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Construir filtro
        let where = {};
        if (status) {
            where = Object.assign(Object.assign({}, where), { status });
        }
        if (priority) {
            where = Object.assign(Object.assign({}, where), { priority });
        }
        // Buscar problemas de rede com filtro e paginação
        const [issues, total] = yield Promise.all([
            prisma_1.prisma.networkIssue.findMany({
                where,
                orderBy: [
                    { created_date: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma_1.prisma.networkIssue.count({ where })
        ]);
        return res.json({
            issues,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar problemas de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllNetworkIssues = getAllNetworkIssues;
/**
 * Obtém um problema de rede por ID
 */
const getNetworkIssueById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const issue = yield prisma_1.prisma.networkIssue.findUnique({
            where: { id }
        });
        if (!issue) {
            return res.status(404).json({ message: 'Problema de rede não encontrado' });
        }
        return res.json(issue);
    }
    catch (error) {
        console.error('Erro ao buscar problema de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getNetworkIssueById = getNetworkIssueById;
/**
 * Cria um novo problema de rede
 */
const createNetworkIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, type, status, priority, affected_customers } = req.body;
        // Validação básica
        if (!title || !description || !type) {
            return res.status(400).json({
                message: 'Título, descrição e tipo são obrigatórios'
            });
        }
        // Criar problema de rede
        const issue = yield prisma_1.prisma.networkIssue.create({
            data: {
                title,
                description,
                type,
                status: status || 'open',
                priority: priority || 'medium',
                affected_customers: affected_customers || [],
                created_date: new Date()
            }
        });
        return res.status(201).json({
            message: 'Problema de rede criado com sucesso',
            issue
        });
    }
    catch (error) {
        console.error('Erro ao criar problema de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createNetworkIssue = createNetworkIssue;
/**
 * Atualiza um problema de rede
 */
const updateNetworkIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, type, status, priority, affected_customers, resolution, resolved_date } = req.body;
        // Verificar se o problema existe
        const issue = yield prisma_1.prisma.networkIssue.findUnique({
            where: { id }
        });
        if (!issue) {
            return res.status(404).json({ message: 'Problema de rede não encontrado' });
        }
        // Atualizar dados
        const updatedIssue = yield prisma_1.prisma.networkIssue.update({
            where: { id },
            data: {
                title: title !== undefined ? title : undefined,
                description: description !== undefined ? description : undefined,
                type: type !== undefined ? type : undefined,
                status: status !== undefined ? status : undefined,
                priority: priority !== undefined ? priority : undefined,
                affected_customers: affected_customers !== undefined ? affected_customers : undefined,
                resolution: resolution !== undefined ? resolution : undefined,
                resolved_date: status === 'resolved' && !issue.resolved_date ? new Date() :
                    resolved_date !== undefined ? resolved_date : undefined
            }
        });
        return res.json({
            message: 'Problema de rede atualizado com sucesso',
            issue: updatedIssue
        });
    }
    catch (error) {
        console.error('Erro ao atualizar problema de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateNetworkIssue = updateNetworkIssue;
/**
 * Remove um problema de rede
 */
const deleteNetworkIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o problema existe
        const issue = yield prisma_1.prisma.networkIssue.findUnique({
            where: { id }
        });
        if (!issue) {
            return res.status(404).json({ message: 'Problema de rede não encontrado' });
        }
        // Remover problema
        yield prisma_1.prisma.networkIssue.delete({
            where: { id }
        });
        return res.json({ message: 'Problema de rede removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover problema de rede:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteNetworkIssue = deleteNetworkIssue;
