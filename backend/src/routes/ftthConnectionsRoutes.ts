import { Router } from 'express';
import { prisma } from '../db/prisma';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Listar todas as conexões
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const connections = await prisma.fTTHConnection.findMany({
      include: {
        source: true,
        target: true
      }
    });
    res.json(connections);
  } catch (error) {
    console.error('Erro ao listar conexões:', error);
    res.status(500).json({ error: 'Erro ao listar conexões' });
  }
});

// Obter uma conexão específica
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const connection = await prisma.fTTHConnection.findUnique({
      where: { id: req.params.id },
      include: {
        source: true,
        target: true
      }
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Conexão não encontrada' });
    }
    
    res.json(connection);
  } catch (error) {
    console.error('Erro ao buscar conexão:', error);
    res.status(500).json({ error: 'Erro ao buscar conexão' });
  }
});

// Criar nova conexão
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      type,
      fibers,
      color,
      coordinates,
      hasSplitter,
      splitterType,
      splitterRatio,
      splitterLocation,
      sourceId,
      targetId,
      notes
    } = req.body;

    const connection = await prisma.fTTHConnection.create({
      data: {
        type,
        fibers,
        color,
        coordinates,
        hasSplitter: hasSplitter || false,
        splitterType,
        splitterRatio,
        splitterLocation,
        sourceId,
        targetId,
        notes,
        status: 'active'
      },
      include: {
        source: true,
        target: true
      }
    });
    
    res.status(201).json(connection);
  } catch (error) {
    console.error('Erro ao criar conexão:', error);
    res.status(500).json({ error: 'Erro ao criar conexão' });
  }
});

// Atualizar conexão
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { 
      type,
      fibers,
      color,
      coordinates,
      hasSplitter,
      splitterType,
      splitterRatio,
      splitterLocation,
      sourceId,
      targetId,
      notes,
      status
    } = req.body;

    // Verificar se a conexão existe
    const existingConnection = await prisma.fTTHConnection.findUnique({
      where: { id: req.params.id }
    });

    if (!existingConnection) {
      return res.status(404).json({ error: 'Conexão não encontrada' });
    }

    const connection = await prisma.fTTHConnection.update({
      where: { id: req.params.id },
      data: {
        type,
        fibers,
        color,
        coordinates,
        hasSplitter,
        splitterType,
        splitterRatio,
        splitterLocation,
        sourceId,
        targetId,
        notes,
        status
      },
      include: {
        source: true,
        target: true
      }
    });
    
    res.json(connection);
  } catch (error) {
    console.error('Erro ao atualizar conexão:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Conexão não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar conexão' });
  }
});

// Excluir conexão
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await prisma.fTTHConnection.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir conexão:', error);
    res.status(500).json({ error: 'Erro ao excluir conexão' });
  }
});

export default router; 