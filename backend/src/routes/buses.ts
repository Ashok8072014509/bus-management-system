import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  const buses = await prisma.bus.findMany();
  res.json(buses);
});

router.post('/', async (req, res) => {
  try {
    const bus = await prisma.bus.create({ data: req.body });
    res.json(bus);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create bus' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const bus = await prisma.bus.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(bus);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update bus' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.bus.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete bus' });
  }
});

export default router;
