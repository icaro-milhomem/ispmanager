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
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Listar todas as conexões
router.get('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connections = yield prisma_1.prisma.fTTHConnection.findMany({
            include: {
                source: true,
                target: true
            }
        });
        res.json(connections);
    }
    catch (error) {
        console.error('Erro ao listar conexões:', error);
        res.status(500).json({ error: 'Erro ao listar conexões' });
    }
}));
// Obter uma conexão específica
router.get('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield prisma_1.prisma.fTTHConnection.findUnique({
            where: { id: req.params.id },
            include: {
                source: true,
                target: true
            }
        });
        if (!connection) {
            return res.status(404).json({ error: 'Conexão não encontrada' });
        }
        res.json(connection);
    }
    catch (error) {
        console.error('Erro ao buscar conexão:', error);
        res.status(500).json({ error: 'Erro ao buscar conexão' });
    }
}));
// Criar nova conexão
router.post('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, fibers, color, coordinates, hasSplitter, splitterType, splitterRatio, splitterLocation, sourceId, targetId, notes } = req.body;
        const connection = yield prisma_1.prisma.fTTHConnection.create({
            data: {
                type,
                fibers,
                color,
                coordinates,
                hasSplitter: hasSplitter || false,
                splitterType,
                splitterRatio,
                splitterLocation,
                sourceId,
                targetId,
                notes,
                status: 'active'
            },
            include: {
                source: true,
                target: true
            }
        });
        res.status(201).json(connection);
    }
    catch (error) {
        console.error('Erro ao criar conexão:', error);
        res.status(500).json({ error: 'Erro ao criar conexão' });
    }
}));
// Atualizar conexão
router.put('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, fibers, color, coordinates, hasSplitter, splitterType, splitterRatio, splitterLocation, sourceId, targetId, notes, status } = req.body;
        // Verificar se a conexão existe
        const existingConnection = yield prisma_1.prisma.fTTHConnection.findUnique({
            where: { id: req.params.id }
        });
        if (!existingConnection) {
            return res.status(404).json({ error: 'Conexão não encontrada' });
        }
        const connection = yield prisma_1.prisma.fTTHConnection.update({
            where: { id: req.params.id },
            data: {
                type,
                fibers,
                color,
                coordinates,
                hasSplitter,
                splitterType,
                splitterRatio,
                splitterLocation,
                sourceId,
                targetId,
                notes,
                status
            },
            include: {
                source: true,
                target: true
            }
        });
        res.json(connection);
    }
    catch (error) {
        console.error('Erro ao atualizar conexão:', error);
        if (error instanceof Error && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Conexão não encontrada' });
        }
        res.status(500).json({ error: 'Erro ao atualizar conexão' });
    }
}));
// Excluir conexão
router.delete('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.fTTHConnection.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao excluir conexão:', error);
        res.status(500).json({ error: 'Erro ao excluir conexão' });
    }
}));
exports.default = router;
