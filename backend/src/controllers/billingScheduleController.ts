import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Obtém todas as programações de faturamento
 */
export const getAllBillingSchedules = async (req: Request, res: Response) => {
  try {
    // Parâmetros de paginação
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtros
    const active = req.query.active === 'true';
    const frequency = req.query.frequency as string;
    
    // Construir o objeto where com base nos filtros
    const where: any = {};
    if (req.query.active !== undefined) where.active = active;
    if (frequency) where.frequency = frequency;
    
    // Buscar programações com paginação
    const [schedules, total] = await Promise.all([
      prisma.billingSchedule.findMany({
        where,
        orderBy: [
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.billingSchedule.count({ where })
    ]);
    
    return res.json({
      schedules,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar programações de faturamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obtém uma programação de faturamento por ID
 */
export const getBillingScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const schedule = await prisma.billingSchedule.findUnique({
      where: { id }
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Programação de faturamento não encontrada' });
    }
    
    return res.json(schedule);
  } catch (error) {
    console.error('Erro ao buscar programação de faturamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cria uma nova programação de faturamento
 */
export const createBillingSchedule = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      active, 
      frequency, 
      generate_day, 
      due_day_offset, 
      send_email, 
      email_template, 
      next_run, 
      notes 
    } = req.body;
    
    // Validação básica
    if (!name || !frequency || generate_day === undefined) {
      return res.status(400).json({ 
        message: 'Nome, frequência e dia de geração são obrigatórios' 
      });
    }
    
    // Validar dia de geração
    if (generate_day < 1 || generate_day > 31) {
      return res.status(400).json({ 
        message: 'O dia de geração deve estar entre 1 e 31' 
      });
    }
    
    // Verificar se já existe uma programação com este nome
    const existingSchedule = await prisma.billingSchedule.findFirst({
      where: { name }
    });
    
    if (existingSchedule) {
      return res.status(400).json({ 
        message: 'Já existe uma programação de faturamento com este nome' 
      });
    }
    
    // Criar programação
    const schedule = await prisma.billingSchedule.create({
      data: {
        name,
        description,
        active: active !== undefined ? active : true,
        frequency,
        generate_day: Number(generate_day),
        due_day_offset: due_day_offset !== undefined ? Number(due_day_offset) : 15,
        send_email: send_email !== undefined ? send_email : true,
        email_template,
        next_run: next_run ? new Date(next_run) : null,
        notes
      }
    });
    
    return res.status(201).json({
      message: 'Programação de faturamento criada com sucesso',
      schedule
    });
  } catch (error) {
    console.error('Erro ao criar programação de faturamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza uma programação de faturamento
 */
export const updateBillingSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      active, 
      frequency, 
      generate_day, 
      due_day_offset, 
      send_email, 
      email_template, 
      next_run, 
      notes 
    } = req.body;
    
    // Verificar se a programação existe
    const schedule = await prisma.billingSchedule.findUnique({
      where: { id }
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Programação de faturamento não encontrada' });
    }
    
    // Validar dia de geração (se fornecido)
    if (generate_day !== undefined && (generate_day < 1 || generate_day > 31)) {
      return res.status(400).json({ 
        message: 'O dia de geração deve estar entre 1 e 31' 
      });
    }
    
    // Verificar se o nome já existe (se foi alterado)
    if (name && name !== schedule.name) {
      const nameExists = await prisma.billingSchedule.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({ message: 'Já existe uma programação de faturamento com este nome' });
      }
    }
    
    // Atualizar dados
    const updatedSchedule = await prisma.billingSchedule.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        active: active !== undefined ? active : undefined,
        frequency: frequency || undefined,
        generate_day: generate_day !== undefined ? Number(generate_day) : undefined,
        due_day_offset: due_day_offset !== undefined ? Number(due_day_offset) : undefined,
        send_email: send_email !== undefined ? send_email : undefined,
        email_template: email_template !== undefined ? email_template : undefined,
        next_run: next_run !== undefined ? (next_run ? new Date(next_run) : null) : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    return res.json({
      message: 'Programação de faturamento atualizada com sucesso',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Erro ao atualizar programação de faturamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove uma programação de faturamento
 */
export const deleteBillingSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se a programação existe
    const schedule = await prisma.billingSchedule.findUnique({
      where: { id }
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Programação de faturamento não encontrada' });
    }
    
    // Remover programação
    await prisma.billingSchedule.delete({
      where: { id }
    });
    
    return res.json({ message: 'Programação de faturamento removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover programação de faturamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Executa manualmente uma programação de faturamento
 */
export const executeBillingSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se a programação existe
    const schedule = await prisma.billingSchedule.findUnique({
      where: { id }
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Programação de faturamento não encontrada' });
    }
    
    if (!schedule.active) {
      return res.status(400).json({ message: 'Não é possível executar uma programação inativa' });
    }
    
    // Esta é apenas uma simulação da execução - a implementação real dependerá da lógica de negócios
    // Aqui você implementaria a geração real das faturas com base na programação
    
    // Atualizar o último e próximo horário de execução
    const now = new Date();
    let nextRun = new Date();
    
    if (schedule.frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(schedule.generate_day);
    } else if (schedule.frequency === 'yearly') {
      nextRun.setFullYear(nextRun.getFullYear() + 1);
      nextRun.setDate(schedule.generate_day);
    }
    
    // Atualizar a programação com os novos tempos de execução
    await prisma.billingSchedule.update({
      where: { id },
      data: {
        last_run: now,
        next_run: nextRun
      }
    });
    
    return res.json({
      message: 'Programação de faturamento executada com sucesso',
      executed_at: now,
      next_scheduled_run: nextRun
    });
  } catch (error) {
    console.error('Erro ao executar programação de faturamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 