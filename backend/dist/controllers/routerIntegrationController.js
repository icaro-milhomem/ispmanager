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
exports.deleteRouterIntegration = exports.updateRouterIntegration = exports.createRouterIntegration = exports.getRouterIntegrationById = exports.getAllRouterIntegrations = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Lista todas as integrações de roteadores
 */
const getAllRouterIntegrations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const routers = yield prisma.routerIntegration.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return res.json(routers);
    }
    catch (error) {
        console.error('Erro ao listar integrações de roteadores:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllRouterIntegrations = getAllRouterIntegrations;
/**
 * Obtém uma integração de roteador pelo ID
 */
const getRouterIntegrationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const router = yield prisma.routerIntegration.findUnique({
            where: { id }
        });
        if (!router) {
            return res.status(404).json({ message: 'Integração de roteador não encontrada' });
        }
        return res.json(router);
    }
    catch (error) {
        console.error('Erro ao buscar integração de roteador:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getRouterIntegrationById = getRouterIntegrationById;
/**
 * Cria uma nova integração de roteador
 */
const createRouterIntegration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, host, port, integration_method, username, password, api_key, is_primary, notes } = req.body;
        // Validação básica
        if (!name || !type || !host || !port || !integration_method || !username) {
            return res.status(400).json({
                message: 'Dados incompletos. Todos os campos obrigatórios devem ser preenchidos.',
                required: ['name', 'type', 'host', 'port', 'integration_method', 'username']
            });
        }
        // Validar método de integração
        if (integration_method === 'api' && !api_key && !password) {
            return res.status(400).json({
                message: 'Para integração via API, forneça api_key ou password'
            });
        }
        if (integration_method === 'ssh' && !password) {
            return res.status(400).json({
                message: 'Para integração via SSH, password é obrigatório'
            });
        }
        // Se is_primary for true, atualizar todas as outras integrações para false
        if (is_primary) {
            yield prisma.routerIntegration.updateMany({
                data: {
                    is_primary: false
                }
            });
        }
        // Criar a integração
        const router = yield prisma.routerIntegration.create({
            data: {
                name,
                type,
                host,
                port,
                integration_method,
                username,
                password,
                api_key,
                is_primary: is_primary || false,
                status: 'active',
                notes
            }
        });
        return res.status(201).json({
            message: 'Integração de roteador criada com sucesso',
            router
        });
    }
    catch (error) {
        console.error('Erro ao criar integração de roteador:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createRouterIntegration = createRouterIntegration;
/**
 * Atualiza uma integração de roteador
 */
const updateRouterIntegration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, type, host, port, integration_method, username, password, api_key, is_primary, status, notes } = req.body;
        // Verificar se a integração existe
        const existingRouter = yield prisma.routerIntegration.findUnique({
            where: { id }
        });
        if (!existingRouter) {
            return res.status(404).json({ message: 'Integração de roteador não encontrada' });
        }
        // Se is_primary for true, atualizar todas as outras integrações para false
        if (is_primary) {
            yield prisma.routerIntegration.updateMany({
                where: {
                    id: {
                        not: id
                    }
                },
                data: {
                    is_primary: false
                }
            });
        }
        // Atualizar a integração
        const router = yield prisma.routerIntegration.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                type: type !== undefined ? type : undefined,
                host: host !== undefined ? host : undefined,
                port: port !== undefined ? port : undefined,
                integration_method: integration_method !== undefined ? integration_method : undefined,
                username: username !== undefined ? username : undefined,
                password: password !== undefined ? password : undefined,
                api_key: api_key !== undefined ? api_key : undefined,
                is_primary: is_primary !== undefined ? is_primary : undefined,
                status: status !== undefined ? status : undefined,
                notes: notes !== undefined ? notes : undefined,
                last_sync: new Date()
            }
        });
        return res.json({
            message: 'Integração de roteador atualizada com sucesso',
            router
        });
    }
    catch (error) {
        console.error('Erro ao atualizar integração de roteador:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateRouterIntegration = updateRouterIntegration;
/**
 * Remove uma integração de roteador
 */
const deleteRouterIntegration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar se a integração existe
        const router = yield prisma.routerIntegration.findUnique({
            where: { id }
        });
        if (!router) {
            return res.status(404).json({ message: 'Integração de roteador não encontrada' });
        }
        // Remover a integração
        yield prisma.routerIntegration.delete({
            where: { id }
        });
        return res.json({ message: 'Integração de roteador removida com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover integração de roteador:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteRouterIntegration = deleteRouterIntegration;
