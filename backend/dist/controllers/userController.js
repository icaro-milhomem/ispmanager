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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = require("../db/prisma");
const auth_1 = require("../utils/auth");
/**
 * Obtém todos os usuários
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.json(users);
    }
    catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllUsers = getAllUsers;
/**
 * Obtém um usuário específico
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verifica permissão: apenas o próprio usuário ou admin pode ver detalhes
        if (req.userId !== id && req.userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        return res.json(user);
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getUserById = getUserById;
/**
 * Cria um novo usuário
 */
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role = 'USER' } = req.body;
        // Validação básica
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Nome, e-mail e senha são obrigatórios'
            });
        }
        // Verifica se o e-mail já está em uso
        const existingUser = yield prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Este e-mail já está em uso' });
        }
        // Criptografa a senha
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        // Cria o usuário
        const user = yield prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        return res.status(201).json({
            message: 'Usuário criado com sucesso',
            user
        });
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createUser = createUser;
/**
 * Atualiza um usuário existente
 */
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        // Verifica permissão: apenas o próprio usuário ou admin pode atualizar
        if (req.userId !== id && req.userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        // Verifica se o usuário existe
        const existingUser = yield prisma_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        // Verifica se o email já está em uso por outro usuário
        if (email && email !== existingUser.email) {
            const emailInUse = yield prisma_1.prisma.user.findUnique({
                where: { email }
            });
            if (emailInUse) {
                return res.status(400).json({ message: 'Este e-mail já está em uso' });
            }
        }
        // Define os dados a serem atualizados
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        // Apenas admin pode alterar a role
        if (role && req.userRole === 'ADMIN') {
            updateData.role = role;
        }
        // Atualiza o usuário
        const updatedUser = yield prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true
            }
        });
        return res.json({
            message: 'Usuário atualizado com sucesso',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateUser = updateUser;
/**
 * Exclui um usuário
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Não permite excluir o próprio usuário
        if (req.userId === id) {
            return res.status(400).json({ message: 'Não é possível excluir sua própria conta' });
        }
        // Verifica se o usuário existe
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        // Exclui o usuário
        yield prisma_1.prisma.user.delete({
            where: { id }
        });
        return res.json({ message: 'Usuário excluído com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.deleteUser = deleteUser;
