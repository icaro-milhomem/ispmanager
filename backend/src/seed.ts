import { prisma } from './db/prisma';
import { hashPassword } from './utils/auth';

async function seed() {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Cria usuário administrador inicial
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.upsert({
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
    const config = await prisma.systemConfig.upsert({
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
    const plano10 = await prisma.plan.upsert({
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

    const plano50 = await prisma.plan.upsert({
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

    const plano100 = await prisma.plan.upsert({
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
  } catch (error) {
    console.error('Erro ao fazer seed do banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
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

export default seed; 