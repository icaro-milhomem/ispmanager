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
// Listar todas as COEs
router.get('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coes = yield prisma_1.prisma.cOE.findMany({
            include: {
                inputFiber: true,
                outputFiber: true
            }
        });
        res.json(coes);
    }
    catch (error) {
        console.error('Erro ao listar COEs:', error);
        res.status(500).json({ error: 'Erro ao listar COEs' });
    }
}));
// Obter uma COE específica
router.get('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coe = yield prisma_1.prisma.cOE.findUnique({
            where: { id: req.params.id },
            include: {
                inputFiber: true,
                outputFiber: true
            }
        });
        if (!coe) {
            return res.status(404).json({ error: 'COE não encontrada' });
        }
        res.json(coe);
    }
    catch (error) {
        console.error('Erro ao buscar COE:', error);
        res.status(500).json({ error: 'Erro ao buscar COE' });
    }
}));
// Criar nova COE
router.post('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, location, latitude, longitude, capacity, inputFiberId, outputFiberId, notes } = req.body;
        const coe = yield prisma_1.prisma.cOE.create({
            data: {
                name,
                type,
                location,
                latitude,
                longitude,
                capacity: capacity || 12,
                inputFiberId,
                outputFiberId,
                notes
            },
            include: {
                inputFiber: true,
                outputFiber: true
            }
        });
        res.status(201).json(coe);
    }
    catch (error) {
        console.error('Erro ao criar COE:', error);
        res.status(500).json({ error: 'Erro ao criar COE' });
    }
}));
// Atualizar COE
router.put('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, location, latitude, longitude, capacity, inputFiberId, outputFiberId, notes, status } = req.body;
        const coe = yield prisma_1.prisma.cOE.update({
            where: { id: req.params.id },
            data: {
                name,
                type,
                location,
                latitude,
                longitude,
                capacity,
                inputFiberId,
                outputFiberId,
                notes,
                status
            },
            include: {
                inputFiber: true,
                outputFiber: true
            }
        });
        res.json(coe);
    }
    catch (error) {
        console.error('Erro ao atualizar COE:', error);
        res.status(500).json({ error: 'Erro ao atualizar COE' });
    }
}));
// Excluir COE
router.delete('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.cOE.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao excluir COE:', error);
        res.status(500).json({ error: 'Erro ao excluir COE' });
    }
}));
exports.default = router;
