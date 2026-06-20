import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  const dailies = await prisma.daily.findMany({
    include: { bus: true, driver: true, conductor: true, trip: true },
    orderBy: { date: 'desc' }
  });
  res.json(dailies);
});

router.post('/', async (req, res) => {
  try {
    const { busId, ...data } = req.body;
    
    const daily = await prisma.daily.create({
      data: {
        ...data,
        busId,
      }
    });
    res.json(daily);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create daily entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { busId, ...data } = req.body;
    
    const daily = await prisma.daily.update({
      where: { id: req.params.id },
      data: {
        ...data,
        busId,
      }
    });

    res.json(daily);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update daily entry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.daily.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete daily entry' });
  }
});

// Dashboard stats endpoint
router.get('/dashboard/stats', async (req, res) => {
  try {
    const dailies = await prisma.daily.findMany({ 
      include: { bus: true, driver: true, conductor: true } 
    });
    
    const expenses = await prisma.expense.findMany({
      include: { bus: true },
      orderBy: { date: 'desc' }
    });

    const buses = await prisma.bus.findMany();
    const activeBuses = buses.filter(b => b.status === 'ACTIVE').length;
    const inactiveBuses = buses.filter(b => b.status !== 'ACTIVE').length;
    const totalBuses = buses.length;

    let todayCollection = 0;
    let todayDieselExpense = 0;
    let todaySalaryExpense = 0;
    let todayMaintenanceExpense = 0;
    let todayOtherExpense = 0;
    let todayAdditionalExpense = 0;

    let totalCollection = 0;
    let totalDieselExpense = 0;
    let totalSalaryExpense = 0;
    let totalMaintenanceExpense = 0;
    let totalOtherExpense = 0;
    let totalAdditionalExpense = 0;

    const todayStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const busStats: Record<string, any> = {};
    buses.forEach(b => {
      busStats[b.id] = {
        bus: b,
        totalCollection: 0,
        totalExpenses: 0,
        profit: 0,
        
        todayCollection: 0,
        todayDieselExpense: 0,
        todaySalaryExpense: 0,
        todayMaintenanceExpense: 0,
        todayOtherExpense: 0,
        todayAdditionalExpense: 0,
        todayTotalExpense: 0,
        todayProfit: 0,

        latestDriver: null,
        latestConductor: null,
        lastDate: new Date(0)
      };
    });

    for (const d of dailies) {
      const dSalary = (d.driverSalaryExpense || 0) + (d.conductorSalaryExpense || 0);
      const dDailyExp = (d.dieselExpense || 0) + dSalary + (d.maintenanceExpense || 0) + (d.otherExpense || 0);
      
      totalCollection += d.totalCollection;
      totalDieselExpense += (d.dieselExpense || 0);
      totalSalaryExpense += dSalary;
      totalMaintenanceExpense += (d.maintenanceExpense || 0);
      totalOtherExpense += (d.otherExpense || 0);

      const dDateStr = new Date(d.date).toISOString().split('T')[0];
      if (dDateStr === todayStr) {
        todayCollection += d.totalCollection;
        todayDieselExpense += (d.dieselExpense || 0);
        todaySalaryExpense += dSalary;
        todayMaintenanceExpense += (d.maintenanceExpense || 0);
        todayOtherExpense += (d.otherExpense || 0);
      }

      if (busStats[d.busId]) {
        busStats[d.busId].totalCollection += d.totalCollection;
        busStats[d.busId].totalExpenses += dDailyExp;
        
        if (dDateStr === todayStr) {
          busStats[d.busId].todayCollection += d.totalCollection;
          busStats[d.busId].todayDieselExpense += (d.dieselExpense || 0);
          busStats[d.busId].todaySalaryExpense += dSalary;
          busStats[d.busId].todayMaintenanceExpense += (d.maintenanceExpense || 0);
          busStats[d.busId].todayOtherExpense += (d.otherExpense || 0);
          busStats[d.busId].todayTotalExpense += dDailyExp;
        }

        if (new Date(d.date) > busStats[d.busId].lastDate) {
          busStats[d.busId].lastDate = new Date(d.date);
          busStats[d.busId].latestDriver = d.driver?.name || '-';
          busStats[d.busId].latestConductor = d.conductor?.name || '-';
        }
      }
    }

    const expenseBreakdown: Record<string, number> = {};

    for (const e of expenses) {
      totalAdditionalExpense += e.amount;
      
      const eDateStr = new Date(e.date).toISOString().split('T')[0];
      if (eDateStr === todayStr) {
        todayAdditionalExpense += e.amount;
      }

      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;

      if (busStats[e.busId]) {
        busStats[e.busId].totalExpenses += e.amount;
        if (eDateStr === todayStr) {
          busStats[e.busId].todayAdditionalExpense += e.amount;
          busStats[e.busId].todayTotalExpense += e.amount;
        }
      }
    }

    // Update profit
    for (const busId in busStats) {
      busStats[busId].profit = busStats[busId].totalCollection - busStats[busId].totalExpenses;
      busStats[busId].todayProfit = busStats[busId].todayCollection - busStats[busId].todayTotalExpense;
    }

    const busCards = Object.values(busStats);

    const breakdownArray = Object.keys(expenseBreakdown).map(cat => ({
      name: cat,
      amount: expenseBreakdown[cat]
    })).sort((a, b) => b.amount - a.amount);
    
    const todayTotalExpense = todayDieselExpense + todaySalaryExpense + todayMaintenanceExpense + todayOtherExpense + todayAdditionalExpense;
    const totalTotalExpense = totalDieselExpense + totalSalaryExpense + totalMaintenanceExpense + totalOtherExpense + totalAdditionalExpense;

    res.json({
      totalBuses,
      activeBuses,
      inactiveBuses,
      
      todayCollection,
      todayDieselExpense,
      todaySalaryExpense,
      todayMaintenanceExpense,
      todayOtherExpense,
      todayAdditionalExpense,
      todayTotalExpense,
      todayProfit: todayCollection - todayTotalExpense,

      totalCollection,
      totalDieselExpense,
      totalSalaryExpense,
      totalMaintenanceExpense,
      totalOtherExpense,
      totalAdditionalExpense,
      totalExpenses: totalTotalExpense,
      totalProfit: totalCollection - totalTotalExpense,
      
      busCards,
      expenseBreakdown: breakdownArray,
      recentExpenses: expenses.slice(0, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
