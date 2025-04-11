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
exports.changePassword = exports.register = exports.login = void 0;
const prisma_1 = require("../db/prisma");
const auth_1 = require("../utils/auth");
/**
 * Login de usuário
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Iniciando processo de login com corpo:", {
            email: req.body.email,
            temSenha: !!req.body.password
        });
        const { email, password } = req.body;
        // Validação básica
        if (!email || !password) {
            console.log("Erro de validação: email ou senha ausente");
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
        }
        // Busca o usuário pelo email
        console.log(`Buscando usuário com email: ${email}`);
        const user = yield prisma_1.prisma.user.findUnique({
            where: { email }
        });
        // Verifica se o usuário existe
        if (!user) {
            console.log(`Usuário não encontrado para o email: ${email}`);
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        console.log(`Usuário encontrado: ${user.id}, validando senha...`);
        // Verifica a senha
        const passwordValid = yield (0, auth_1.comparePassword)(password, user.password);
        console.log(`Resultado de validação da senha: ${passwordValid}`);
        if (!passwordValid) {
            console.log("Senha inválida");
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        // Gera o token JWT
        const token = (0, auth_1.generateToken)(user);
        console.log("Token JWT gerado com sucesso");
        // Retorna os dados do usuário (exceto a senha) e o token
        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.login = login;
/**
 * Cadastro de usuário
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            }
        });
        // Gera o token JWT
        const token = (0, auth_1.generateToken)(user);
        // Retorna os dados do usuário (exceto a senha) e o token
        return res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.register = register;
/**
 * Alteração de senha
 */
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // userId é adicionado pelo middleware de autenticação
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;
        // Validação básica
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Senha atual e nova senha são obrigatórias'
            });
        }
        // Busca o usuário
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        // Verifica se a senha atual está correta
        const passwordValid = yield (0, auth_1.comparePassword)(currentPassword, user.password);
        if (!passwordValid) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
        }
        // Criptografa a nova senha
        const hashedPassword = yield (0, auth_1.hashPassword)(newPassword);
        // Atualiza a senha do usuário
        yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return res.json({ message: 'Senha alterada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao alterar senha:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.changePassword = changePassword;
