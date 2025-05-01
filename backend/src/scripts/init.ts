import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se já existe uma configuração
    const existingConfig = await prisma.systemConfig.findFirst();
    
    if (!existingConfig) {
      console.log('Criando configuração inicial do sistema...');
      await prisma.systemConfig.create({
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
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@ispmanager.com' }
    });

    if (!existingAdmin) {
      console.log('Criando usuário administrador...');
      const hashedPassword = await hashPassword('admin123');
      await prisma.user.create({
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
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 