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
const client_1 = require("@prisma/client");
const auth_1 = require("../utils/auth");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar se já existe uma configuração
            const existingConfig = yield prisma.systemConfig.findFirst();
            if (!existingConfig) {
                console.log('Criando configuração inicial do sistema...');
                yield prisma.systemConfig.create({
                    data: {
                        company_name: 'ISP Manager',
                        company_logo_url: '',
                        company_address: '',
                        company_phone: '',
                        company_email: 'contato@ispmanager.com',
                        company_website: '',
                        admin_email: 'admin@ispmanager.com',
                        smtp_host: '',
                        smtp_port: null,
                        smtp_user: '',
                        smtp_pass: '',
                        login_background_color: '#ffffff',
                        login_text_color: '#000000',
                        login_button_color: '#1976d2'
                    }
                });
                console.log('Configuração inicial criada com sucesso!');
            }
            // Verificar se já existe um usuário admin
            const existingAdmin = yield prisma.user.findFirst({
                where: { email: 'admin@ispmanager.com' }
            });
            if (!existingAdmin) {
                console.log('Criando usuário administrador...');
                const hashedPassword = yield (0, auth_1.hashPassword)('admin123');
                yield prisma.user.create({
                    data: {
                        name: 'Administrador',
                        email: 'admin@ispmanager.com',
                        password: hashedPassword,
                        role: 'ADMIN'
                    }
                });
                console.log('Usuário administrador criado com sucesso!');
            }
            console.log('Inicialização concluída!');
        }
        catch (error) {
            console.error('Erro durante a inicialização:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
