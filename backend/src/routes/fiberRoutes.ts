import { Router } from 'express';
import { prisma } from '../db/prisma';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Listar todas as fibras
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const fibers = await prisma.fiber.findMany({
      include: {
        coeInputs: true,
        coeOutputs: true,
        splitters: true
      }
    });
    res.json(fibers);
  } catch (error) {
    console.error('Erro ao listar fibras:', error);
    res.status(500).json({ error: 'Erro ao listar fibras' });
  }
});

// Obter uma fibra específica
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const fiber = await prisma.fiber.findUnique({
      where: { id: req.params.id },
      include: {
        coeInputs: true,
        coeOutputs: true,
        splitters: true
      }
    });
    
    if (!fiber) {
      return res.status(404).json({ error: 'Fibra não encontrada' });
    }
    
    res.json(fiber);
  } catch (error) {
    console.error('Erro ao buscar fibra:', error);
    res.status(500).json({ error: 'Erro ao buscar fibra' });
  }
});

// Criar nova fibra
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, color, length, type, status, notes } = req.body;
    
    const fiber = await prisma.fiber.create({
      data: {
        name,
        color,
        length,
        type,
        status,
        notes
      },
      include: {
        coeInputs: true,
        coeOutputs: true,
        splitters: true
      }
    });
    
    res.status(201).json(fiber);
  } catch (error) {
    console.error('Erro ao criar fibra:', error);
    res.status(500).json({ error: 'Erro ao criar fibra' });
  }
});

// Atualizar fibra
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, color, length, type, status, notes } = req.body;
    
    const fiber = await prisma.fiber.update({
      where: { id: req.params.id },
      data: {
        name,
        color,
        length,
        type,
        status,
        notes
      },
      include: {
        coeInputs: true,
        coeOutputs: true,
        splitters: true
      }
    });
    
    res.json(fiber);
  } catch (error) {
    console.error('Erro ao atualizar fibra:', error);
    res.status(500).json({ error: 'Erro ao atualizar fibra' });
  }
});

// Excluir fibra
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await prisma.fiber.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir fibra:', error);
    res.status(500).json({ error: 'Erro ao excluir fibra' });
  }
});

export default router; 