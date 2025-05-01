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
// Listar todos os splitters
router.get('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const splitters = yield prisma_1.prisma.splitter.findMany({
            include: {
                fiber: true
            }
        });
        res.json(splitters);
    }
    catch (error) {
        console.error('Erro ao listar splitters:', error);
        res.status(500).json({ error: 'Erro ao listar splitters' });
    }
}));
// Obter um splitter específico
router.get('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const splitter = yield prisma_1.prisma.splitter.findUnique({
            where: { id: req.params.id },
            include: {
                fiber: true
            }
        });
        if (!splitter) {
            return res.status(404).json({ error: 'Splitter não encontrado' });
        }
        res.json(splitter);
    }
    catch (error) {
        console.error('Erro ao buscar splitter:', error);
        res.status(500).json({ error: 'Erro ao buscar splitter' });
    }
}));
// Criar novo splitter
router.post('/', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, ratio, type, location, latitude, longitude, fiberId, notes } = req.body;
        const splitter = yield prisma_1.prisma.splitter.create({
            data: {
                name,
                ratio,
                type,
                location,
                latitude,
                longitude,
                fiberId,
                notes
            },
            include: {
                fiber: true
            }
        });
        res.status(201).json(splitter);
    }
    catch (error) {
        console.error('Erro ao criar splitter:', error);
        res.status(500).json({ error: 'Erro ao criar splitter' });
    }
}));
// Atualizar splitter
router.put('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, ratio, type, location, latitude, longitude, fiberId, notes, status } = req.body;
        const splitter = yield prisma_1.prisma.splitter.update({
            where: { id: req.params.id },
            data: {
                name,
                ratio,
                type,
                location,
                latitude,
                longitude,
                fiberId,
                notes,
                status
            },
            include: {
                fiber: true
            }
        });
        res.json(splitter);
    }
    catch (error) {
        console.error('Erro ao atualizar splitter:', error);
        res.status(500).json({ error: 'Erro ao atualizar splitter' });
    }
}));
// Excluir splitter
router.delete('/:id', auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.splitter.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao excluir splitter:', error);
        res.status(500).json({ error: 'Erro ao excluir splitter' });
    }
}));
exports.default = router;
