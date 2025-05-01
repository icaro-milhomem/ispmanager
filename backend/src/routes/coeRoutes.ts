import { Router } from 'express';
import { prisma } from '../db/prisma';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Listar todas as COEs
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const coes = await prisma.cOE.findMany({
      include: {
        inputFiber: true,
        outputFiber: true
      }
    });
    res.json(coes);
  } catch (error) {
    console.error('Erro ao listar COEs:', error);
    res.status(500).json({ error: 'Erro ao listar COEs' });
  }
});

// Obter uma COE específica
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const coe = await prisma.cOE.findUnique({
      where: { id: req.params.id },
      include: {
        inputFiber: true,
        outputFiber: true
      }
    });
    
    if (!coe) {
      return res.status(404).json({ error: 'COE não encontrada' });
    }
    
    res.json(coe);
  } catch (error) {
    console.error('Erro ao buscar COE:', error);
    res.status(500).json({ error: 'Erro ao buscar COE' });
  }
});

// Criar nova COE
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, type, location, latitude, longitude, capacity, inputFiberId, outputFiberId, notes } = req.body;
    
    const coe = await prisma.cOE.create({
      data: {
        name,
        type,
        location,
        latitude,
        longitude,
        capacity: capacity || 12,
        inputFiberId,
        outputFiberId,
        notes
      },
      include: {
        inputFiber: true,
        outputFiber: true
      }
    });
    
    res.status(201).json(coe);
  } catch (error) {
    console.error('Erro ao criar COE:', error);
    res.status(500).json({ error: 'Erro ao criar COE' });
  }
});

// Atualizar COE
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, type, location, latitude, longitude, capacity, inputFiberId, outputFiberId, notes, status } = req.body;
    
    const coe = await prisma.cOE.update({
      where: { id: req.params.id },
      data: {
        name,
        type,
        location,
        latitude,
        longitude,
        capacity,
        inputFiberId,
        outputFiberId,
        notes,
        status
      },
      include: {
        inputFiber: true,
        outputFiber: true
      }
    });
    
    res.json(coe);
  } catch (error) {
    console.error('Erro ao atualizar COE:', error);
    res.status(500).json({ error: 'Erro ao atualizar COE' });
  }
});

// Excluir COE
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await prisma.cOE.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir COE:', error);
    res.status(500).json({ error: 'Erro ao excluir COE' });
  }
});

export default router; 