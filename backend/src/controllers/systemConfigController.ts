import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

// Obter todas as configurações do sistema
export const getAllConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await prisma.systemConfig.findMany();
    return res.json(configs);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return res.status(500).json({ error: 'Erro ao buscar configurações do sistema' });
  }
};

// Obter configuração por ID
export const getConfigById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id }
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    return res.json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração por ID:', error);
    return res.status(500).json({ error: 'Erro ao buscar configuração por ID' });
  }
};

// Criar nova configuração (normalmente só haverá uma)
export const createConfig = async (req: Request, res: Response) => {
  const { 
    company_name, 
    company_logo_url,
    company_address,
    company_phone,
    company_email,
    company_website,
    admin_email,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_pass,
    login_background_color,
    login_text_color,
    login_button_color
  } = req.body;
  
  try {
    // Verificar se já existe alguma configuração
    const existingConfigs = await prisma.systemConfig.findMany();
    
    if (existingConfigs.length > 0) {
      return res.status(400).json({ 
        error: 'Já existe uma configuração no sistema. Utilize o método PUT para atualizar.'
      });
    }
    
    const newConfig = await prisma.systemConfig.create({
      data: {
        company_name,
        company_logo_url,
        company_address,
        company_phone,
        company_email,
        company_website,
        admin_email,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_pass,
        login_background_color,
        login_text_color,
        login_button_color
      }
    });
    
    return res.status(201).json({
      message: 'Configuração criada com sucesso',
      config: newConfig
    });
  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    return res.status(500).json({ error: 'Erro ao criar configuração do sistema' });
  }
};

// Atualizar configuração
export const updateConfig = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    company_name, 
    company_logo_url,
    company_address,
    company_phone,
    company_email,
    company_website,
    admin_email,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_pass,
    login_background_color,
    login_text_color,
    login_button_color
  } = req.body;
  
  try {
    // Verificar se a configuração existe
    const config = await prisma.systemConfig.findUnique({
      where: { id }
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    // Atualizar a configuração
    const updatedConfig = await prisma.systemConfig.update({
      where: { id },
      data: {
        company_name,
        company_logo_url,
        company_address,
        company_phone,
        company_email,
        company_website,
        admin_email,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_pass,
        login_background_color,
        login_text_color,
        login_button_color
      }
    });
    
    return res.json({
      message: 'Configuração atualizada com sucesso',
      config: updatedConfig
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return res.status(500).json({ error: 'Erro ao atualizar configuração do sistema' });
  }
};

// Excluir configuração (raramente utilizado)
export const deleteConfig = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Verificar se a configuração existe
    const config = await prisma.systemConfig.findUnique({
      where: { id }
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    // Excluir a configuração
    await prisma.systemConfig.delete({
      where: { id }
    });
    
    return res.json({ message: 'Configuração excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir configuração:', error);
    return res.status(500).json({ error: 'Erro ao excluir configuração do sistema' });
  }
}; 