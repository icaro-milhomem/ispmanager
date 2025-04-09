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
exports.deleteConfig = exports.updateConfig = exports.createConfig = exports.getConfigById = exports.getAllConfigs = void 0;
const prisma_1 = require("../db/prisma");
// Obter todas as configurações do sistema
const getAllConfigs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configs = yield prisma_1.prisma.systemConfig.findMany();
        return res.json(configs);
    }
    catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return res.status(500).json({ error: 'Erro ao buscar configurações do sistema' });
    }
});
exports.getAllConfigs = getAllConfigs;
// Obter configuração por ID
const getConfigById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const config = yield prisma_1.prisma.systemConfig.findUnique({
            where: { id }
        });
        if (!config) {
            return res.status(404).json({ error: 'Configuração não encontrada' });
        }
        return res.json(config);
    }
    catch (error) {
        console.error('Erro ao buscar configuração por ID:', error);
        return res.status(500).json({ error: 'Erro ao buscar configuração por ID' });
    }
});
exports.getConfigById = getConfigById;
// Criar nova configuração (normalmente só haverá uma)
const createConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { company_name, company_logo_url, company_address, company_phone, company_email, company_website, admin_email, smtp_host, smtp_port, smtp_user, smtp_pass, login_background_color, login_text_color, login_button_color } = req.body;
    try {
        // Verificar se já existe alguma configuração
        const existingConfigs = yield prisma_1.prisma.systemConfig.findMany();
        if (existingConfigs.length > 0) {
            return res.status(400).json({
                error: 'Já existe uma configuração no sistema. Utilize o método PUT para atualizar.'
            });
        }
        const newConfig = yield prisma_1.prisma.systemConfig.create({
            data: {
                company_name,
                company_logo_url,
                company_address,
                company_phone,
                company_email,
                company_website,
                admin_email,
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
            message: 'Configuração criada com sucesso',
            config: newConfig
        });
    }
    catch (error) {
        console.error('Erro ao criar configuração:', error);
        return res.status(500).json({ error: 'Erro ao criar configuração do sistema' });
    }
});
exports.createConfig = createConfig;
// Atualizar configuração
const updateConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { company_name, company_logo_url, company_address, company_phone, company_email, company_website, admin_email, smtp_host, smtp_port, smtp_user, smtp_pass, login_background_color, login_text_color, login_button_color } = req.body;
    try {
        // Verificar se a configuração existe
        const config = yield prisma_1.prisma.systemConfig.findUnique({
            where: { id }
        });
        if (!config) {
            return res.status(404).json({ error: 'Configuração não encontrada' });
        }
        // Atualizar a configuração
        const updatedConfig = yield prisma_1.prisma.systemConfig.update({
            where: { id },
            data: {
                company_name,
                company_logo_url,
                company_address,
                company_phone,
                company_email,
                company_website,
                admin_email,
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_pass,
                login_background_color,
                login_text_color,
                login_button_color
            }
        });
        return res.json({
            message: 'Configuração atualizada com sucesso',
            config: updatedConfig
        });
    }
    catch (error) {
        console.error('Erro ao atualizar configuração:', error);
        return res.status(500).json({ error: 'Erro ao atualizar configuração do sistema' });
    }
});
exports.updateConfig = updateConfig;
// Excluir configuração (raramente utilizado)
const deleteConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Verificar se a configuração existe
        const config = yield prisma_1.prisma.systemConfig.findUnique({
            where: { id }
        });
        if (!config) {
            return res.status(404).json({ error: 'Configuração não encontrada' });
        }
        // Excluir a configuração
        yield prisma_1.prisma.systemConfig.delete({
            where: { id }
        });
        return res.json({ message: 'Configuração excluída com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir configuração:', error);
        return res.status(500).json({ error: 'Erro ao excluir configuração do sistema' });
    }
});
exports.deleteConfig = deleteConfig;
