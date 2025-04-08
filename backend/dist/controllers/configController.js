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
exports.updateSystemConfig = exports.getSystemConfig = void 0;
const prisma_1 = require("../db/prisma");
/**
 * Obtém as configurações do sistema
 */
const getSystemConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Busca as configurações do sistema (sempre usando o ID 1)
        const config = yield prisma_1.prisma.systemConfig.findFirst();
        if (!config) {
            return res.status(404).json({ message: 'Configurações do sistema não encontradas' });
        }
        // Remove campos sensíveis antes de retornar
        const publicConfig = {
            id: config.id,
            company_name: config.company_name,
            company_logo_url: config.company_logo_url,
            admin_email: config.admin_email
        };
        return res.json(publicConfig);
    }
    catch (error) {
        console.error('Erro ao buscar configurações do sistema:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getSystemConfig = getSystemConfig;
/**
 * Atualiza as configurações do sistema
 */
const updateSystemConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { company_name, company_logo_url, admin_email, smtp_host, smtp_port, smtp_user, smtp_pass } = req.body;
        // Busca as configurações do sistema
        let config = yield prisma_1.prisma.systemConfig.findFirst();
        if (!config) {
            // Se não existir, cria uma nova configuração
            config = yield prisma_1.prisma.systemConfig.create({
                data: {
                    company_name: company_name || 'ISP Manager',
                    company_logo_url,
                    admin_email: admin_email || 'admin@ispmanager.com',
                    smtp_host,
                    smtp_port,
                    smtp_user,
                    smtp_pass
                }
            });
            return res.status(201).json({
                message: 'Configurações do sistema criadas com sucesso',
                config: {
                    id: config.id,
                    company_name: config.company_name,
                    company_logo_url: config.company_logo_url,
                    admin_email: config.admin_email
                }
            });
        }
        // Atualiza as configurações existentes
        const updatedConfig = yield prisma_1.prisma.systemConfig.update({
            where: { id: config.id },
            data: {
                company_name: company_name || config.company_name,
                company_logo_url: company_logo_url !== undefined ? company_logo_url : config.company_logo_url,
                admin_email: admin_email || config.admin_email,
                smtp_host: smtp_host !== undefined ? smtp_host : config.smtp_host,
                smtp_port: smtp_port !== undefined ? smtp_port : config.smtp_port,
                smtp_user: smtp_user !== undefined ? smtp_user : config.smtp_user,
                smtp_pass: smtp_pass !== undefined ? smtp_pass : config.smtp_pass
            }
        });
        // Remove campos sensíveis antes de retornar
        const publicConfig = {
            id: updatedConfig.id,
            company_name: updatedConfig.company_name,
            company_logo_url: updatedConfig.company_logo_url,
            admin_email: updatedConfig.admin_email,
            has_smtp: Boolean(updatedConfig.smtp_host && updatedConfig.smtp_port)
        };
        return res.json({
            message: 'Configurações do sistema atualizadas com sucesso',
            config: publicConfig
        });
    }
    catch (error) {
        console.error('Erro ao atualizar configurações do sistema:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateSystemConfig = updateSystemConfig;
