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
// Listar todas as CTOs
router.get('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ctos = yield prisma_1.prisma.cTO.findMany({
            include: {
                ports: true
            }
        });
        res.json(ctos);
    }
    catch (error) {
        console.error('Erro ao listar CTOs:', error);
        res.status(500).json({ error: 'Erro ao listar CTOs' });
    }
}));
// Obter uma CTO específica
router.get('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cto = yield prisma_1.prisma.cTO.findUnique({
            where: { id: req.params.id },
            include: {
                ports: true
            }
        });
        if (!cto) {
            return res.status(404).json({ error: 'CTO não encontrada' });
        }
        res.json(cto);
    }
    catch (error) {
        console.error('Erro ao buscar CTO:', error);
        res.status(500).json({ error: 'Erro ao buscar CTO' });
    }
}));
// Criar nova CTO
router.post('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, latitude, longitude, capacity, address, notes, ports } = req.body;
        const cto = yield prisma_1.prisma.cTO.create({
            data: {
                name,
                latitude,
                longitude,
                capacity,
                address,
                notes,
                ports: {
                    create: (ports === null || ports === void 0 ? void 0 : ports.map((port) => ({
                        number: port.number,
                        status: port.status,
                        clientName: port.clientName,
                        clientId: port.clientId
                    }))) || []
                }
            },
            include: {
                ports: true
            }
        });
        res.status(201).json(cto);
    }
    catch (error) {
        console.error('Erro ao criar CTO:', error);
        res.status(500).json({ error: 'Erro ao criar CTO' });
    }
}));
// Atualizar CTO
router.put('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, latitude, longitude, capacity, address, notes, ports } = req.body;
        // Primeiro exclui todas as portas existentes
        yield prisma_1.prisma.port.deleteMany({
            where: { ctoId: req.params.id }
        });
        // Atualiza a CTO e cria novas portas
        const cto = yield prisma_1.prisma.cTO.update({
            where: { id: req.params.id },
            data: {
                name,
                latitude,
                longitude,
                capacity,
                address,
                notes,
                ports: {
                    create: (ports === null || ports === void 0 ? void 0 : ports.map((port) => ({
                        number: port.number,
                        status: port.status,
                        clientName: port.clientName,
                        clientId: port.clientId
                    }))) || []
                }
            },
            include: {
                ports: true
            }
        });
        res.json(cto);
    }
    catch (error) {
        console.error('Erro ao atualizar CTO:', error);
        res.status(500).json({ error: 'Erro ao atualizar CTO' });
    }
}));
// Excluir CTO
router.delete('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.cTO.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao excluir CTO:', error);
        res.status(500).json({ error: 'Erro ao excluir CTO' });
    }
}));
exports.default = router;
