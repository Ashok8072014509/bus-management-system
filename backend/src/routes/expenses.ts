import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all expenses (with optional busId and date range filtering)
router.get('/', async (req, res) => {
  try {
    const { busId, from, to } = req.query;
    let whereClause: any = {};

    if (busId && busId !== 'all') {
      whereClause.busId = busId as string;
    }

    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);
      toDate.setUTCHours(23, 59, 59, 999);
      whereClause.date = { gte: fromDate, lte: toDate };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: { bus: true },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { busId, date, category, amount, description, notes, addedBy } = req.body;
    
    if (!busId || !category || amount === undefined) {
      return res.status(400).json({ error: 'Bus, Category, and Amount are required' });
    }

    const newExpense = await prisma.expense.create({
      data: {
        busId,
        date: date ? new Date(date) : new Date(),
        category,
        amount: Number(amount),
        description,
        notes,
        addedBy
      },
      include: { bus: true }
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { busId, date, category, amount, description, notes, addedBy } = req.body;
    
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        busId,
        date: date ? new Date(date) : undefined,
        category,
        amount: amount !== undefined ? Number(amount) : undefined,
        description,
        notes,
        addedBy
      },
      include: { bus: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
