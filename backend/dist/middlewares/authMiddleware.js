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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verificar se o token está presente
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Não autorizado: Token não fornecido' });
        }
        // Verifica formato do token (Bearer TOKEN)
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Erro no formato do token' });
        }
        const [scheme, token] = parts;
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Token mal formatado' });
        }
        // Verifica e decodifica o token
        const secret = process.env.JWT_SECRET || 'default_secret_key';
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(401).json({ message: 'Token inválido ou expirado' });
            }
            const { id, role } = decoded;
            // Verifica se o usuário ainda existe no banco
            const userExists = yield prisma_1.prisma.user.findUnique({
                where: { id }
            });
            if (!userExists) {
                return res.status(401).json({ message: 'Usuário não encontrado' });
            }
            // Adiciona id e role do usuário à requisição para uso posterior
            req.userId = id;
            req.userRole = role;
            return next();
        }));
    }
    catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.authMiddleware = authMiddleware;
