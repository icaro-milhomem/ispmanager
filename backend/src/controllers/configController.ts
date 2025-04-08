import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém as configurações do sistema
 */
export const getSystemConfig = async (req: Request, res: Response) => {
  try {
    // Busca as configurações do sistema (sempre usando o ID 1)
    const config = await prisma.systemConfig.findFirst();
    
    if (!config) {
      return res.status(404).json({ message: 'Configurações do sistema não encontradas' });
    }

    // Remove campos sensíveis antes de retornar
    const publicConfig = {
      id: config.id,
      company_name: config.company_name,
      company_logo_url: config.company_logo_url,
      admin_email: config.admin_email
    };

    return res.json(publicConfig);
  } catch (error) {
    console.error('Erro ao buscar configurações do sistema:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza as configurações do sistema
 */
export const updateSystemConfig = async (req: Request, res: Response) => {
  try {
    const { 
      company_name, 
      company_logo_url, 
      admin_email, 
      smtp_host, 
      smtp_port, 
      smtp_user, 
      smtp_pass 
    } = req.body;

    // Busca as configurações do sistema
    let config = await prisma.systemConfig.findFirst();
    
    if (!config) {
      // Se não existir, cria uma nova configuração
      config = await prisma.systemConfig.create({
        data: {
          company_name: company_name || 'ISP Manager',
          company_logo_url,
          admin_email: admin_email || 'admin@ispmanager.com',
          smtp_host,
          smtp_port,
          smtp_user,
          smtp_pass
        }
      });
      
      return res.status(201).json({ 
        message: 'Configurações do sistema criadas com sucesso',
        config: {
          id: config.id,
          company_name: config.company_name,
          company_logo_url: config.company_logo_url,
          admin_email: config.admin_email
        }
      });
    }

    // Atualiza as configurações existentes
    const updatedConfig = await prisma.systemConfig.update({
      where: { id: config.id },
      data: {
        company_name: company_name || config.company_name,
        company_logo_url: company_logo_url !== undefined ? company_logo_url : config.company_logo_url,
        admin_email: admin_email || config.admin_email,
        smtp_host: smtp_host !== undefined ? smtp_host : config.smtp_host,
        smtp_port: smtp_port !== undefined ? smtp_port : config.smtp_port,
        smtp_user: smtp_user !== undefined ? smtp_user : config.smtp_user,
        smtp_pass: smtp_pass !== undefined ? smtp_pass : config.smtp_pass
      }
    });

    // Remove campos sensíveis antes de retornar
    const publicConfig = {
      id: updatedConfig.id,
      company_name: updatedConfig.company_name,
      company_logo_url: updatedConfig.company_logo_url,
      admin_email: updatedConfig.admin_email,
      has_smtp: Boolean(updatedConfig.smtp_host && updatedConfig.smtp_port)
    };

    return res.json({ 
      message: 'Configurações do sistema atualizadas com sucesso',
      config: publicConfig
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações do sistema:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 