import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

/**
 * Login de usuário
 */
export const login = async (req: Request, res: Response) => {
  try {
    console.log("Iniciando processo de login com corpo:", {
      email: req.body.email,
      temSenha: !!req.body.password
    });

    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      console.log("Erro de validação: email ou senha ausente");
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    }

    // Busca o usuário pelo email
    console.log(`Buscando usuário com email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Verifica se o usuário existe
    if (!user) {
      console.log(`Usuário não encontrado para o email: ${email}`);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    console.log(`Usuário encontrado: ${user.id}, validando senha...`);

    // Verifica a senha
    const passwordValid = await comparePassword(password, user.password);
    console.log(`Resultado de validação da senha: ${passwordValid}`);
    
    if (!passwordValid) {
      console.log("Senha inválida");
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gera o token JWT
    const token = generateToken(user);
    console.log("Token JWT gerado com sucesso");

    // Retorna os dados do usuário (exceto a senha) e o token
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cadastro de usuário
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Nome, e-mail e senha são obrigatórios' 
      });
    }

    // Verifica se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }

    // Criptografa a senha
    const hashedPassword = await hashPassword(password);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role
      }
    });

    // Gera o token JWT
    const token = generateToken(user);

    // Retorna os dados do usuário (exceto a senha) e o token
    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Alteração de senha
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // userId é adicionado pelo middleware de autenticação
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // Validação básica
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Senha atual e nova senha são obrigatórias' 
      });
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verifica se a senha atual está correta
    const passwordValid = await comparePassword(currentPassword, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    // Criptografa a nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualiza a senha do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 