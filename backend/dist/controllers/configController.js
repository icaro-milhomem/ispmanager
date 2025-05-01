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
        const { company_name, company_logo_url, admin_email, company_email, smtp_host, smtp_port, smtp_user, smtp_pass, company_address, company_phone, company_website, login_background_color, login_text_color, login_button_color } = req.body;
        // Verificar admin_email - campo obrigatório
        const effectiveAdminEmail = admin_email || company_email || 'admin@ispmanager.com';
        console.log(`Admin email para configuração: ${effectiveAdminEmail}`);
        // Busca as configurações do sistema
        let config = yield prisma_1.prisma.systemConfig.findFirst();
        if (!config) {
            // Se não existir, cria uma nova configuração
            console.log("Criando nova configuração do sistema");
            config = yield prisma_1.prisma.systemConfig.create({
                data: {
                    company_name: company_name || 'ISP Manager',
                    company_logo_url,
                    company_address,
                    company_phone,
                    company_email,
                    company_website,
                    admin_email: effectiveAdminEmail,
                    smtp_host,
                    smtp_port,
                    smtp_user,
                    smtp_pass,
                    login_background_color,
                    login_text_color,
                    login_button_color
                }
            });
            return res.status(201).json({
                message: 'Configurações do sistema criadas com sucesso',
                config: {
                    id: config.id,
                    company_name: config.company_name,
                    company_logo_url: config.company_logo_url,
                    admin_email: config.admin_email,
                    company_email: config.company_email,
                    company_address: config.company_address,
                    company_phone: config.company_phone,
                    company_website: config.company_website,
                    login_background_color: config.login_background_color,
                    login_text_color: config.login_text_color,
                    login_button_color: config.login_button_color
                }
            });
        }
        console.log(`Atualizando configuração existente com ID: ${config.id}`);
        // Atualiza as configurações existentes
        const updatedConfig = yield prisma_1.prisma.systemConfig.update({
            where: { id: config.id },
            data: {
                company_name: company_name || config.company_name,
                company_logo_url: company_logo_url !== undefined ? company_logo_url : config.company_logo_url,
                admin_email: effectiveAdminEmail,
                company_email: company_email !== undefined ? company_email : config.company_email,
                company_address: company_address !== undefined ? company_address : config.company_address,
                company_phone: company_phone !== undefined ? company_phone : config.company_phone,
                company_website: company_website !== undefined ? company_website : config.company_website,
                smtp_host: smtp_host !== undefined ? smtp_host : config.smtp_host,
                smtp_port: smtp_port !== undefined ? smtp_port : config.smtp_port,
                smtp_user: smtp_user !== undefined ? smtp_user : config.smtp_user,
                smtp_pass: smtp_pass !== undefined ? smtp_pass : config.smtp_pass,
                login_background_color: login_background_color !== undefined ? login_background_color : config.login_background_color,
                login_text_color: login_text_color !== undefined ? login_text_color : config.login_text_color,
                login_button_color: login_button_color !== undefined ? login_button_color : config.login_button_color
            }
        });
        return res.json({
            message: 'Configurações do sistema atualizadas com sucesso',
            config: {
                id: updatedConfig.id,
                company_name: updatedConfig.company_name,
                company_logo_url: updatedConfig.company_logo_url,
                admin_email: updatedConfig.admin_email,
                company_email: updatedConfig.company_email,
                company_address: updatedConfig.company_address,
                company_phone: updatedConfig.company_phone,
                company_website: updatedConfig.company_website,
                login_background_color: updatedConfig.login_background_color,
                login_text_color: updatedConfig.login_text_color,
                login_button_color: updatedConfig.login_button_color
            }
        });
    }
    catch (error) {
        console.error('Erro ao atualizar configurações do sistema:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updateSystemConfig = updateSystemConfig;
