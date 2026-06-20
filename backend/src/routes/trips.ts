import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  const trips = await prisma.trip.findMany({ include: { bus: true, driver: true, conductor: true } });
  res.json(trips);
});

router.post('/', async (req, res) => {
  try {
    const trip = await prisma.trip.create({ data: req.body });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create trip' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update trip' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete trip' });
  }
});

export default router;
