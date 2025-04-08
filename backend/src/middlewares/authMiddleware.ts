import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Estende o tipo Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verificar se o token está presente
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Não autorizado: Token não fornecido' });
    }

    // Verifica formato do token (Bearer TOKEN)
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Erro no formato do token' });
    }

    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Token mal formatado' });
    }

    // Verifica e decodifica o token
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
      }

      const { id, role } = decoded as TokenPayload;

      // Verifica se o usuário ainda existe no banco
      const userExists = await prisma.user.findUnique({
        where: { id }
      });

      if (!userExists) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      // Adiciona id e role do usuário à requisição para uso posterior
      req.userId = id;
      req.userRole = role;

      return next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 