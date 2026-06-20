import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const dailies = await prisma.daily.findMany({
      include: { bus: true },
      orderBy: { date: 'asc' }
    });
    
    const expenses = await prisma.expense.findMany({
      include: { bus: true },
      orderBy: { date: 'asc' }
    });

    const dailyTrends: Record<string, { date: string, collection: number, expenses: number, profit: number, maintenance: number }> = {};
    const busPerformance: Record<string, { busName: string, busNumber: string, collection: number, expenses: number, profit: number, maintenance: number }> = {};
    const categoryDistribution: Record<string, number> = {};

    dailies.forEach(d => {
      const dateStr = new Date(d.date).toISOString().split('T')[0];
      if (!dailyTrends[dateStr]) dailyTrends[dateStr] = { date: dateStr, collection: 0, expenses: 0, profit: 0, maintenance: 0 };
      
      const dSalary = (d.driverSalaryExpense || 0) + (d.conductorSalaryExpense || 0);
      const dDailyExp = (d.dieselExpense || 0) + dSalary + (d.maintenanceExpense || 0) + (d.otherExpense || 0);

      dailyTrends[dateStr].collection += d.totalCollection;
      dailyTrends[dateStr].expenses += dDailyExp;
      dailyTrends[dateStr].maintenance += (d.maintenanceExpense || 0);

      if (!busPerformance[d.busId]) busPerformance[d.busId] = { busName: d.bus.busName, busNumber: d.bus.registrationNumber, collection: 0, expenses: 0, profit: 0, maintenance: 0 };
      busPerformance[d.busId].collection += d.totalCollection;
      busPerformance[d.busId].expenses += dDailyExp;
      busPerformance[d.busId].maintenance += (d.maintenanceExpense || 0);

      categoryDistribution['Diesel'] = (categoryDistribution['Diesel'] || 0) + (d.dieselExpense || 0);
      categoryDistribution['Driver Salary'] = (categoryDistribution['Driver Salary'] || 0) + (d.driverSalaryExpense || 0);
      categoryDistribution['Conductor Salary'] = (categoryDistribution['Conductor Salary'] || 0) + (d.conductorSalaryExpense || 0);
      categoryDistribution['Daily Maintenance'] = (categoryDistribution['Daily Maintenance'] || 0) + (d.maintenanceExpense || 0);
      categoryDistribution['Other Daily Expenses'] = (categoryDistribution['Other Daily Expenses'] || 0) + (d.otherExpense || 0);
    });

    expenses.forEach(e => {
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      if (!dailyTrends[dateStr]) dailyTrends[dateStr] = { date: dateStr, collection: 0, expenses: 0, profit: 0, maintenance: 0 };
      
      dailyTrends[dateStr].expenses += e.amount;
      const isMaint = e.category.toLowerCase().includes('maintenance') || e.category.toLowerCase().includes('repair') || e.category.toLowerCase().includes('tyre');
      if (isMaint) dailyTrends[dateStr].maintenance += e.amount;

      if (!busPerformance[e.busId]) busPerformance[e.busId] = { busName: e.bus.busName, busNumber: e.bus.registrationNumber, collection: 0, expenses: 0, profit: 0, maintenance: 0 };
      
      busPerformance[e.busId].expenses += e.amount;
      if (isMaint) busPerformance[e.busId].maintenance += e.amount;

      categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + e.amount;
    });

    // Compute profit
    Object.keys(dailyTrends).forEach(k => dailyTrends[k].profit = dailyTrends[k].collection - dailyTrends[k].expenses);
    Object.keys(busPerformance).forEach(k => busPerformance[k].profit = busPerformance[k].collection - busPerformance[k].expenses);

    const trendsArray = Object.values(dailyTrends).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const performanceArray = Object.values(busPerformance);

    let topBus = null, lowestBus = null, highestExpenseBus = null, highestRevenueBus = null, mostMaintenanceBus = null;

    if (performanceArray.length > 0) {
      topBus = performanceArray.reduce((prev, current) => (prev.profit > current.profit) ? prev : current);
      lowestBus = performanceArray.reduce((prev, current) => (prev.profit < current.profit) ? prev : current);
      highestExpenseBus = performanceArray.reduce((prev, current) => (prev.expenses > current.expenses) ? prev : current);
      highestRevenueBus = performanceArray.reduce((prev, current) => (prev.collection > current.collection) ? prev : current);
      mostMaintenanceBus = performanceArray.reduce((prev, current) => (prev.maintenance > current.maintenance) ? prev : current);
    }

    const catDistArray = Object.keys(categoryDistribution).map(cat => ({ name: cat, value: categoryDistribution[cat] }));

    res.json({
      dailyTrends: trendsArray,
      busPerformance: performanceArray,
      topBus, lowestBus, highestExpenseBus, highestRevenueBus, mostMaintenanceBus,
      categoryDistribution: catDistArray
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
