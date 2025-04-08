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
exports.deleteContract = exports.updateContract = exports.createContract = exports.getContractById = exports.getAllContracts = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém todos os contratos
 */
const getAllContracts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parâmetros de paginação
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtros
        const status = req.query.status;
        const customerId = req.query.customerId;
        // Construir o objeto where com base nos filtros
        const where = {};
        if (status)
            where.status = status;
        if (customerId)
            where.customerId = customerId;
        // Buscar contratos com paginação
        const [contracts, total] = yield Promise.all([
            prisma_1.prisma.contract.findMany({
                where,
                orderBy: [
                    { startDate: 'desc' }
                ],
                include: {
                    customer: {
                        select: {
                            id: true,
                            full_name: true,
                            document_number: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                skip,
                take: limit
            }),
            prisma_1.prisma.contract.count({ where })
        ]);
        return res.json({
            contracts,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar contratos:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllContracts = getAllContracts;
/**
 * Obtém um contrato por ID
 */
const getContractById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const contract = yield prisma_1.prisma.contract.findUnique({
            where: { id },
            include: {
                customer: {
                    select: {
                        id: true,
                        full_name: true,
                        document_number: true,
                        email: true,
                        phone: true,
                        address: true,
                        planId: true,
                        plan: true
                    }
                }
            }
        });
        if (!contract) {
            return res.status(404).json({ message: 'Contrato não encontrado' });
        }
        return res.json(contract);
    }
    catch (error) {
        console.error('Erro ao buscar contrato:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getContractById = getContractById;
/**
 * Cria um novo contrato
 */
const createContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, number, startDate, endDate, status, document_url, signature_date, terms } = req.body;
        // Validação básica
        if (!customerId || !number || !startDate || !terms) {
            return res.status(400).json({
                message: 'Cliente, número do contrato, data de início e termos são obrigatórios'
            });
        }
        // Verificar se o cliente existe
        const customer = yield prisma_1.prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!customer) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        // Verificar se já existe um contrato com este número
        const existingContract = yield prisma_1.prisma.contract.findFirst({
            where: { number }
        });
        if (existingContract) {
            return res.status(400).json({
                message: 'Já existe um contrato com este número'
            });
        }
        // Criar contrato
        const contract = yield prisma_1.prisma.contract.create({
            data: {
                customerId,
                number,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                status: status || 'ACTIVE',
                document_url,
                signature_date: signature_date ? new Date(signature_date) : null,
                terms
            }
        });
        return res.status(201).json({
            message: 'Contrato criado com sucesso',
            contract
        });
    }
    catch (error) {
        console.error('Erro ao criar contrato:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createContract = createContract;
/**
 * Atualiza um contrato
 */
const updateContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { customerId, number, startDate, endDate, status, document_url, signature_date, terms } = req.body;
        // Verificar se o contrato existe
        const contract = yield prisma_1.prisma.contract.findUnique({
            where: { id }
        });
        if (!contract) {
            return res.status(404).json({ message: 'Contrato não encontrado' });
        }
        // Verificar se o cliente existe (se foi alterado)
        if (customerId && customerId !== contract.customerId) {
            const customer = yield prisma_1.prisma.customer.findUnique({
                where: { id: customerId }
            });
            if (!customer) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }
        }
        // Verificar se o número do contrato já existe (se foi alterado)
        if (number && number !== contract.number) {
            const numberExists = yield prisma_1.prisma.contract.findFirst({
                where: {
                    number,
                    id: { not: id }
                }
            });
            if (numberExists) {
                return res.status(400).json({ message: 'Já existe um contrato com este número' });
            }
        }
        // Atualizar dados
        const updatedContract = yield prisma_1.prisma.contract.update({
            where: { id },
            data: {
                customerId: customerId || undefined,
                number: number || undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
                status: status || undefined,
                document_url: document_url !== undefined ? document_url : undefined,
                signature_date: signature_date !== undefined ? (signature_date ? new Date(signature_date) : null) : undefined,
                terms: terms || undefined
            }
        });
        return res.json({
            message: 'Contrato atualizado com sucesso',
            contract: updatedContract
        });
    }
    catch (error) {
        console.error('Erro ao atualizar contrato:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateContract = updateContract;
/**
 * Remove um contrato
 */
const deleteContract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se o contrato existe
        const contract = yield prisma_1.prisma.contract.findUnique({
            where: { id }
        });
        if (!contract) {
            return res.status(404).json({ message: 'Contrato não encontrado' });
        }
        // Verificar se o contrato pode ser excluído (status)
        if (contract.status === 'ACTIVE') {
            return res.status(400).json({
                message: 'Não é possível excluir um contrato ativo. Cancele o contrato primeiro.'
            });
        }
        // Remover contrato
        yield prisma_1.prisma.contract.delete({
            where: { id }
        });
        return res.json({ message: 'Contrato removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover contrato:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteContract = deleteContract;
