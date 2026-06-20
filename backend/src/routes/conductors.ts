import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all conductors
router.get('/', async (req, res) => {
  try {
    const conductors = await prisma.conductor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(conductors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conductors' });
  }
});

// Create conductor
router.post('/', async (req, res) => {
  try {
    const { name, phone, licenseNumber, address, salary, status } = req.body;
    const conductor = await prisma.conductor.create({
      data: { name, phone, licenseNumber, address, salary, status }
    });
    res.status(201).json(conductor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conductor' });
  }
});

// Update conductor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, licenseNumber, address, salary, status } = req.body;
    const conductor = await prisma.conductor.update({
      where: { id },
      data: { name, phone, licenseNumber, address, salary, status }
    });
    res.json(conductor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update conductor' });
  }
});

// Delete conductor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.conductor.delete({ where: { id } });
    res.json({ message: 'Conductor deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conductor' });
  }
});

export default router;
