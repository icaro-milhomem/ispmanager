import { Router } from 'express';
import { prisma } from '../db/prisma';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Listar todas as CTOs
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const ctos = await prisma.cTO.findMany({
      include: {
        ports: true
      }
    });
    res.json(ctos);
  } catch (error) {
    console.error('Erro ao listar CTOs:', error);
    res.status(500).json({ error: 'Erro ao listar CTOs' });
  }
});

// Obter uma CTO específica
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const cto = await prisma.cTO.findUnique({
      where: { id: req.params.id },
      include: {
        ports: true
      }
    });
    
    if (!cto) {
      return res.status(404).json({ error: 'CTO não encontrada' });
    }
    
    res.json(cto);
  } catch (error) {
    console.error('Erro ao buscar CTO:', error);
    res.status(500).json({ error: 'Erro ao buscar CTO' });
  }
});

// Criar nova CTO
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, latitude, longitude, capacity, address, notes, ports } = req.body;
    
    const cto = await prisma.cTO.create({
      data: {
        name,
        latitude,
        longitude,
        capacity,
        address,
        notes,
        ports: {
          create: ports?.map((port: any) => ({
            number: port.number,
            status: port.status,
            clientName: port.clientName,
            clientId: port.clientId
          })) || []
        }
      },
      include: {
        ports: true
      }
    });
    
    res.status(201).json(cto);
  } catch (error) {
    console.error('Erro ao criar CTO:', error);
    res.status(500).json({ error: 'Erro ao criar CTO' });
  }
});

// Atualizar CTO
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, latitude, longitude, capacity, address, notes, ports } = req.body;
    
    // Primeiro exclui todas as portas existentes
    await prisma.port.deleteMany({
      where: { ctoId: req.params.id }
    });
    
    // Atualiza a CTO e cria novas portas
    const cto = await prisma.cTO.update({
      where: { id: req.params.id },
      data: {
        name,
        latitude,
        longitude,
        capacity,
        address,
        notes,
        ports: {
          create: ports?.map((port: any) => ({
            number: port.number,
            status: port.status,
            clientName: port.clientName,
            clientId: port.clientId
          })) || []
        }
      },
      include: {
        ports: true
      }
    });
    
    res.json(cto);
  } catch (error) {
    console.error('Erro ao atualizar CTO:', error);
    res.status(500).json({ error: 'Erro ao atualizar CTO' });
  }
});

// Atualizar posição da CTO
router.put('/:id/position', authenticateJWT, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const cto = await prisma.cTO.update({
      where: { id: req.params.id },
      data: {
        latitude,
        longitude
      },
      include: {
        ports: true
      }
    });
    
    res.json(cto);
  } catch (error) {
    console.error('Erro ao atualizar posição da CTO:', error);
    res.status(500).json({ error: 'Erro ao atualizar posição da CTO' });
  }
});

// Excluir CTO
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await prisma.cTO.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir CTO:', error);
    res.status(500).json({ error: 'Erro ao excluir CTO' });
  }
});

export default router; 