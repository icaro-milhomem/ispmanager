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
// Listar todas as fibras
router.get('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fibers = yield prisma_1.prisma.fiber.findMany({
            include: {
                olt: true,
                splitters: true,
                coeInputs: true,
                coeOutputs: true
            }
        });
        res.json(fibers);
    }
    catch (error) {
        console.error('Erro ao listar fibras:', error);
        res.status(500).json({ error: 'Erro ao listar fibras' });
    }
}));
// Obter uma fibra específica
router.get('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fiber = yield prisma_1.prisma.fiber.findUnique({
            where: { id: req.params.id },
            include: {
                olt: true,
                splitters: true,
                coeInputs: true,
                coeOutputs: true
            }
        });
        if (!fiber) {
            return res.status(404).json({ error: 'Fibra não encontrada' });
        }
        res.json(fiber);
    }
    catch (error) {
        console.error('Erro ao buscar fibra:', error);
        res.status(500).json({ error: 'Erro ao buscar fibra' });
    }
}));
// Criar nova fibra
router.post('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, color, length, type, oltId, notes } = req.body;
        const fiber = yield prisma_1.prisma.fiber.create({
            data: {
                name,
                color,
                length,
                type,
                oltId,
                notes
            },
            include: {
                olt: true
            }
        });
        res.status(201).json(fiber);
    }
    catch (error) {
        console.error('Erro ao criar fibra:', error);
        res.status(500).json({ error: 'Erro ao criar fibra' });
    }
}));
// Atualizar fibra
router.put('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, color, length, type, oltId, notes, status } = req.body;
        const fiber = yield prisma_1.prisma.fiber.update({
            where: { id: req.params.id },
            data: {
                name,
                color,
                length,
                type,
                oltId,
                notes,
                status
            },
            include: {
                olt: true
            }
        });
        res.json(fiber);
    }
    catch (error) {
        console.error('Erro ao atualizar fibra:', error);
        res.status(500).json({ error: 'Erro ao atualizar fibra' });
    }
}));
// Excluir fibra
router.delete('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.fiber.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao excluir fibra:', error);
        res.status(500).json({ error: 'Erro ao excluir fibra' });
    }
}));
exports.default = router;
