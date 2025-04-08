import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Verifica se o usuário é um administrador
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Acesso negado: permissões de administrador necessárias' 
      });
    }

    // Se o usuário é um administrador, continua
    return next();
  } catch (error) {
    console.error('Erro no middleware de administrador:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 