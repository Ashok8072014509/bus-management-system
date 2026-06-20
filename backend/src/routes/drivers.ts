import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  const drivers = await prisma.driver.findMany();
  res.json(drivers);
});

router.post('/', async (req, res) => {
  try {
    const driver = await prisma.driver.create({ data: req.body });
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create driver' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update driver' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.driver.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete driver' });
  }
});

export default router;
