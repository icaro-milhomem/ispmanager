import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Interface para usuário
interface User {
  id: string;
  role: string;
}

/**
 * Gera um hash seguro para senha
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compara senha fornecida com hash armazenado
 */
export const comparePassword = async (
  password: string, 
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Gera um token JWT para o usuário
 */
export const generateToken = (user: User): string => {
  // Usa as credenciais do ambiente ou fallback para valores padrão
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  // Cria o payload do token
  const payload = { 
    id: user.id,
    role: user.role
  };

  // @ts-ignore - Ignorando o erro de tipagem do jwt.sign
  return jwt.sign(payload, secret, { expiresIn });
}; 