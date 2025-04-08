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
exports.getAllIPAssignments = exports.getIPAssignments = exports.deleteIPAssignment = exports.updateIPAssignment = exports.addIPAssignment = exports.deleteIPPool = exports.updateIPPool = exports.createIPPool = exports.getIPPoolById = exports.getAllIPPools = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os pools de IP
 */
const getAllIPPools = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Buscar pools de IP com paginação
        const [pools, total] = yield Promise.all([
            prisma_1.prisma.iPPool.findMany({
                orderBy: [
                    { name: 'asc' }
                ],
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            ip_assignments: true
                        }
                    }
                }
            }),
            prisma_1.prisma.iPPool.count()
        ]);
        return res.json({
            pools,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar pools de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllIPPools = getAllIPPools;
/**
 * Obtém um pool de IP por ID
 */
const getIPPoolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pool = yield prisma_1.prisma.iPPool.findUnique({
            where: { id },
            include: {
                ip_assignments: true
            }
        });
        if (!pool) {
            return res.status(404).json({ message: 'Pool de IP não encontrado' });
        }
        return res.json(pool);
    }
    catch (error) {
        console.error('Erro ao buscar pool de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getIPPoolById = getIPPoolById;
/**
 * Cria um novo pool de IP
 */
const createIPPool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, subnet, mask, gateway, dns_primary, dns_secondary } = req.body;
        // Validação básica
        if (!name || !subnet || !mask || !gateway) {
            return res.status(400).json({
                message: 'Nome, rede, máscara e gateway são obrigatórios'
            });
        }
        // Verificar se já existe um pool com este nome
        const existingPool = yield prisma_1.prisma.iPPool.findFirst({
            where: { name }
        });
        if (existingPool) {
            return res.status(400).json({
                message: 'Já existe um pool com este nome'
            });
        }
        // Criar pool de IP
        const pool = yield prisma_1.prisma.iPPool.create({
            data: {
                name,
                subnet,
                mask,
                gateway,
                dns_primary,
                dns_secondary
            }
        });
        return res.status(201).json({
            message: 'Pool de IP criado com sucesso',
            pool
        });
    }
    catch (error) {
        console.error('Erro ao criar pool de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createIPPool = createIPPool;
/**
 * Atualiza um pool de IP
 */
const updateIPPool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, subnet, mask, gateway, dns_primary, dns_secondary } = req.body;
        // Verificar se o pool existe
        const pool = yield prisma_1.prisma.iPPool.findUnique({
            where: { id }
        });
        if (!pool) {
            return res.status(404).json({ message: 'Pool de IP não encontrado' });
        }
        // Verificar se há outro pool com o mesmo nome (exceto este)
        if (name && name !== pool.name) {
            const nameExists = yield prisma_1.prisma.iPPool.findFirst({
                where: {
                    name,
                    id: { not: id }
                }
            });
            if (nameExists) {
                return res.status(400).json({ message: 'Já existe um pool com este nome' });
            }
        }
        // Atualizar dados
        const updatedPool = yield prisma_1.prisma.iPPool.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                subnet: subnet !== undefined ? subnet : undefined,
                mask: mask !== undefined ? mask : undefined,
                gateway: gateway !== undefined ? gateway : undefined,
                dns_primary: dns_primary !== undefined ? dns_primary : undefined,
                dns_secondary: dns_secondary !== undefined ? dns_secondary : undefined
            }
        });
        return res.json({
            message: 'Pool de IP atualizado com sucesso',
            pool: updatedPool
        });
    }
    catch (error) {
        console.error('Erro ao atualizar pool de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateIPPool = updateIPPool;
/**
 * Remove um pool de IP
 */
const deleteIPPool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o pool existe
        const pool = yield prisma_1.prisma.iPPool.findUnique({
            where: { id },
            include: {
                ip_assignments: true
            }
        });
        if (!pool) {
            return res.status(404).json({ message: 'Pool de IP não encontrado' });
        }
        // Impedir exclusão se tiver atribuições de IP
        if (pool.ip_assignments.length > 0) {
            return res.status(400).json({
                message: 'Não é possível excluir um pool que possui IPs atribuídos'
            });
        }
        // Remover pool
        yield prisma_1.prisma.iPPool.delete({
            where: { id }
        });
        return res.json({ message: 'Pool de IP removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover pool de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteIPPool = deleteIPPool;
/**
 * Adiciona uma atribuição de IP
 */
const addIPAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poolId } = req.params;
        const { ip, status, customer_name, customer_id, assignment_type, mac_address } = req.body;
        // Validação básica
        if (!ip) {
            return res.status(400).json({ message: 'IP é obrigatório' });
        }
        // Verificar se o pool existe
        const pool = yield prisma_1.prisma.iPPool.findUnique({
            where: { id: poolId }
        });
        if (!pool) {
            return res.status(404).json({ message: 'Pool de IP não encontrado' });
        }
        // Verificar se o IP já está atribuído
        const existingAssignment = yield prisma_1.prisma.iPAssignment.findFirst({
            where: {
                ip_pool_id: poolId,
                ip
            }
        });
        if (existingAssignment) {
            return res.status(400).json({ message: 'Este IP já está atribuído neste pool' });
        }
        // Criar atribuição
        const assignment = yield prisma_1.prisma.iPAssignment.create({
            data: {
                ip_pool_id: poolId,
                ip,
                status: status || 'available',
                customer_name,
                customer_id,
                assignment_type,
                mac_address,
                last_seen: assignment_type === 'active' ? new Date() : null
            }
        });
        return res.status(201).json({
            message: 'IP atribuído com sucesso',
            assignment
        });
    }
    catch (error) {
        console.error('Erro ao atribuir IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.addIPAssignment = addIPAssignment;
/**
 * Atualiza uma atribuição de IP
 */
const updateIPAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poolId, assignmentId } = req.params;
        const { status, customer_name, customer_id, assignment_type, mac_address, last_seen } = req.body;
        // Verificar se a atribuição existe
        const assignment = yield prisma_1.prisma.iPAssignment.findFirst({
            where: {
                id: assignmentId,
                ip_pool_id: poolId
            }
        });
        if (!assignment) {
            return res.status(404).json({ message: 'Atribuição de IP não encontrada' });
        }
        // Atualizar atribuição
        const updatedAssignment = yield prisma_1.prisma.iPAssignment.update({
            where: { id: assignmentId },
            data: {
                status: status !== undefined ? status : undefined,
                customer_name: customer_name !== undefined ? customer_name : undefined,
                customer_id: customer_id !== undefined ? customer_id : undefined,
                assignment_type: assignment_type !== undefined ? assignment_type : undefined,
                mac_address: mac_address !== undefined ? mac_address : undefined,
                last_seen: last_seen !== undefined ? new Date(last_seen) : undefined
            }
        });
        return res.json({
            message: 'Atribuição de IP atualizada com sucesso',
            assignment: updatedAssignment
        });
    }
    catch (error) {
        console.error('Erro ao atualizar atribuição de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateIPAssignment = updateIPAssignment;
/**
 * Remove uma atribuição de IP
 */
const deleteIPAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poolId, assignmentId } = req.params;
        // Verificar se a atribuição existe
        const assignment = yield prisma_1.prisma.iPAssignment.findFirst({
            where: {
                id: assignmentId,
                ip_pool_id: poolId
            }
        });
        if (!assignment) {
            return res.status(404).json({ message: 'Atribuição de IP não encontrada' });
        }
        // Remover atribuição
        yield prisma_1.prisma.iPAssignment.delete({
            where: { id: assignmentId }
        });
        return res.json({ message: 'Atribuição de IP removida com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover atribuição de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteIPAssignment = deleteIPAssignment;
/**
 * Lista todas as atribuições de IP de um pool
 */
const getIPAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poolId } = req.params;
        const { status, customer_id } = req.query;
        // Verificar se o pool existe
        const pool = yield prisma_1.prisma.iPPool.findUnique({
            where: { id: poolId }
        });
        if (!pool) {
            return res.status(404).json({ message: 'Pool de IP não encontrado' });
        }
        // Construir o filtro de consulta
        const where = {
            ip_pool_id: poolId
        };
        if (status) {
            where.status = status;
        }
        if (customer_id) {
            where.customer_id = customer_id;
        }
        // Buscar as atribuições
        const assignments = yield prisma_1.prisma.iPAssignment.findMany({
            where,
            orderBy: {
                ip: 'asc'
            }
        });
        return res.json(assignments);
    }
    catch (error) {
        console.error('Erro ao listar atribuições de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getIPAssignments = getIPAssignments;
/**
 * Lista todas as atribuições de IP do sistema
 */
const getAllIPAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, customer_id, ip_pool_id } = req.query;
        // Construir o filtro de consulta
        const where = {};
        if (status) {
            where.status = status;
        }
        if (customer_id) {
            where.customer_id = customer_id;
        }
        if (ip_pool_id) {
            where.ip_pool_id = ip_pool_id;
        }
        // Buscar as atribuições
        const assignments = yield prisma_1.prisma.iPAssignment.findMany({
            where,
            include: {
                ip_pool: true
            },
            orderBy: {
                ip: 'asc'
            }
        });
        return res.json(assignments);
    }
    catch (error) {
        console.error('Erro ao listar todas as atribuições de IP:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllIPAssignments = getAllIPAssignments;
