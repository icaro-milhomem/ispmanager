import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se já existe um usuário admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@teste.com'
      }
    });

    if (existingAdmin) {
      console.log('O usuário administrador já existe:', existingAdmin.email);
      return;
    }

    // Criar senha criptografada
    const hashedPassword = await bcrypt.hash('senha123', 10);

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@teste.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Usuário administrador criado com sucesso:', admin);
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 