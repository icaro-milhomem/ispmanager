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
const prisma_1 = require("./db/prisma");
const auth_1 = require("./utils/auth");
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Iniciando seed do banco de dados...');
            // Cria usuário administrador inicial
            const adminPassword = yield (0, auth_1.hashPassword)('admin123');
            const admin = yield prisma_1.prisma.user.upsert({
                where: { email: 'admin@ispmanager.com' },
                update: {},
                create: {
                    name: 'Administrador',
                    email: 'admin@ispmanager.com',
                    password: adminPassword,
                    role: 'ADMIN'
                }
            });
            console.log('Usuário administrador criado:', admin.id);
            // Cria configuração inicial do sistema
            const config = yield prisma_1.prisma.systemConfig.upsert({
                where: { id: '1' },
                update: {},
                create: {
                    id: '1',
                    company_name: 'ISP Manager',
                    admin_email: 'admin@ispmanager.com'
                }
            });
            console.log('Configuração do sistema criada:', config.id);
            // Cria planos iniciais
            const plano10 = yield prisma_1.prisma.plan.upsert({
                where: { id: '1' },
                update: {},
                create: {
                    id: '1',
                    name: 'Plano 10Mbps',
                    description: 'Plano básico com 10Mbps',
                    price: 49.90,
                    download: 10,
                    upload: 5
                }
            });
            console.log('Plano 10Mbps criado');
            const plano50 = yield prisma_1.prisma.plan.upsert({
                where: { id: '2' },
                update: {},
                create: {
                    id: '2',
                    name: 'Plano 50Mbps',
                    description: 'Plano intermediário com 50Mbps',
                    price: 79.90,
                    download: 50,
                    upload: 10
                }
            });
            console.log('Plano 50Mbps criado');
            const plano100 = yield prisma_1.prisma.plan.upsert({
                where: { id: '3' },
                update: {},
                create: {
                    id: '3',
                    name: 'Plano 100Mbps',
                    description: 'Plano avançado com 100Mbps',
                    price: 99.90,
                    download: 100,
                    upload: 20
                }
            });
            console.log('Plano 100Mbps criado');
            console.log('Seed do banco de dados concluído com sucesso!');
            return { admin, config, planos: [plano10, plano50, plano100] };
        }
        catch (error) {
            console.error('Erro ao fazer seed do banco de dados:', error);
            throw error;
        }
        finally {
            yield prisma_1.prisma.$disconnect();
        }
    });
}
// Executa o seed se o script for chamado diretamente
if (require.main === module) {
    seed()
        .then(() => {
        console.log('Processo de seed finalizado!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Falha no processo de seed:', error);
        process.exit(1);
    });
}
exports.default = seed;
