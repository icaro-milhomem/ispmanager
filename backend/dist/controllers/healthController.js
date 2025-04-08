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
exports.checkHealth = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Verifica a saúde geral do sistema
 */
const checkHealth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica a conexão com o banco de dados
        let dbStatus = {
            connected: false,
            name: 'PostgreSQL'
        };
        try {
            // Realiza uma consulta simples no banco para verificar se está conectado
            yield prisma_1.prisma.$queryRaw `SELECT 1`;
            dbStatus.connected = true;
        }
        catch (dbError) {
            console.error('Erro na conexão com o banco de dados:', dbError);
        }
        // Informações sobre a API
        const apiInfo = {
            status: 'online',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        };
        return res.json({
            status: 'ok',
            message: 'API está funcionando corretamente',
            version: apiInfo.version,
            environment: apiInfo.environment,
            timestamp: apiInfo.timestamp,
            database: dbStatus
        });
    }
    catch (error) {
        console.error('Erro ao verificar a saúde do sistema:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar a saúde do sistema',
            timestamp: new Date().toISOString()
        });
    }
});
exports.checkHealth = checkHealth;
