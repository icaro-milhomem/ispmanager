import { Router } from 'express';
import { prisma } from '../db/prisma';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Listar todos os splitters
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const splitters = await prisma.splitter.findMany({
      include: {
        fiber: true
      }
    });
    res.json(splitters);
  } catch (error) {
    console.error('Erro ao listar splitters:', error);
    res.status(500).json({ error: 'Erro ao listar splitters' });
  }
});

// Obter um splitter específico
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const splitter = await prisma.splitter.findUnique({
      where: { id: req.params.id },
      include: {
        fiber: true
      }
    });
    
    if (!splitter) {
      return res.status(404).json({ error: 'Splitter não encontrado' });
    }
    
    res.json(splitter);
  } catch (error) {
    console.error('Erro ao buscar splitter:', error);
    res.status(500).json({ error: 'Erro ao buscar splitter' });
  }
});

// Criar novo splitter
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, ratio, type, location, latitude, longitude, fiberId, notes } = req.body;
    
    const splitter = await prisma.splitter.create({
      data: {
        name,
        ratio,
        type,
        location,
        latitude,
        longitude,
        fiberId,
        notes
      },
      include: {
        fiber: true
      }
    });
    
    res.status(201).json(splitter);
  } catch (error) {
    console.error('Erro ao criar splitter:', error);
    res.status(500).json({ error: 'Erro ao criar splitter' });
  }
});

// Atualizar splitter
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, ratio, type, location, latitude, longitude, fiberId, notes, status } = req.body;
    
    const splitter = await prisma.splitter.update({
      where: { id: req.params.id },
      data: {
        name,
        ratio,
        type,
        location,
        latitude,
        longitude,
        fiberId,
        notes,
        status
      },
      include: {
        fiber: true
      }
    });
    
    res.json(splitter);
  } catch (error) {
    console.error('Erro ao atualizar splitter:', error);
    res.status(500).json({ error: 'Erro ao atualizar splitter' });
  }
});

// Excluir splitter
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await prisma.splitter.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir splitter:', error);
    res.status(500).json({ error: 'Erro ao excluir splitter' });
  }
});

export default router; 