import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Verifica a saúde geral do sistema
 */
export const checkHealth = async (req: Request, res: Response) => {
  try {
    // Verifica a conexão com o banco de dados
    let dbStatus = {
      connected: false,
      name: 'PostgreSQL'
    };

    try {
      // Realiza uma consulta simples no banco para verificar se está conectado
      await prisma.$queryRaw`SELECT 1`;
      dbStatus.connected = true;
    } catch (dbError) {
      console.error('Erro na conexão com o banco de dados:', dbError);
    }

    // Informações sobre a API
    const apiInfo = {
      status: 'online',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    return res.json({
      status: 'ok',
      message: 'API está funcionando corretamente',
      version: apiInfo.version,
      environment: apiInfo.environment,
      timestamp: apiInfo.timestamp,
      database: dbStatus
    });
  } catch (error) {
    console.error('Erro ao verificar a saúde do sistema:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar a saúde do sistema',
      timestamp: new Date().toISOString()
    });
  }
}; 