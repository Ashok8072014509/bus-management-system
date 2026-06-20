import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit-table';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/pdf', async (req, res) => {
  try {
    const { from, to, busId } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to date' });
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);
    toDate.setUTCHours(23, 59, 59, 999);

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape', bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${from}-to-${to}.pdf"`);

    doc.pipe(res);

    if (busId && busId !== 'all') {
      // INDIVIDUAL BUS REPORT
      const bus = await prisma.bus.findUnique({ where: { id: busId as string } });
      if (!bus) return res.status(404).json({ error: 'Bus not found' });

      const dailies = await prisma.daily.findMany({
        where: { busId: bus.id, date: { gte: fromDate, lte: toDate } },
        include: { driver: true, conductor: true },
        orderBy: { date: 'asc' }
      });

      const expenses = await prisma.expense.findMany({
        where: { busId: bus.id, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: 'asc' }
      });

      doc.fontSize(20).text('Bus Service Management System', { align: 'center' });
      doc.fontSize(14).text('BUS REPORT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Bus Number: ${bus.registrationNumber}`);
      doc.text(`Bus Name: ${bus.busName}`);
      doc.text(`From Date: ${fromDate.toLocaleDateString()}`);
      doc.text(`To Date: ${toDate.toLocaleDateString()}`);
      doc.moveDown();

      let tCol = 0, tDiesel = 0, tSal = 0, tMaint = 0, tOther = 0;

      const dailyRows = dailies.map(d => {
        const dSal = (d.driverSalaryExpense || 0) + (d.conductorSalaryExpense || 0);
        const dTotExp = (d.dieselExpense || 0) + dSal + (d.maintenanceExpense || 0) + (d.otherExpense || 0);
        
        tCol += d.totalCollection;
        tDiesel += (d.dieselExpense || 0);
        tSal += dSal;
        tMaint += (d.maintenanceExpense || 0);
        tOther += (d.otherExpense || 0);

        return [
          new Date(d.date).toLocaleDateString(),
          d.driver?.name || '-',
          d.conductor?.name || '-',
          `Rs ${d.totalCollection}`,
          `Rs ${d.dieselExpense || 0}`,
          `Rs ${dSal}`,
          `Rs ${d.maintenanceExpense || 0}`,
          `Rs ${d.otherExpense || 0}`,
          `Rs ${dTotExp}`,
          `Rs ${d.totalCollection - dTotExp}`
        ];
      });

      await doc.table({
        title: "REPORT TABLE (DAILY ENTRIES)",
        headers: ["Date", "Driver", "Conductor", "Collection", "Diesel", "Salary", "Maintenance", "Other", "Total Exp", "Remaining"],
        rows: dailyRows.length > 0 ? dailyRows : [["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]]
      }, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
        prepareRow: () => doc.font("Helvetica").fontSize(9),
      });
      doc.moveDown();

      let tAdd = 0;
      const addRows = expenses.map(e => {
        tAdd += e.amount;
        return [
          new Date(e.date).toLocaleDateString(),
          e.category,
          e.description || '-',
          `Rs ${e.amount}`
        ];
      });

      await doc.table({
        title: "ADDITIONAL EXPENSES",
        headers: ["Date", "Category", "Description", "Amount"],
        rows: addRows.length > 0 ? addRows : [["-", "-", "-", "-"]]
      }, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
        prepareRow: () => doc.font("Helvetica").fontSize(9),
      });
      doc.moveDown();

      const gTotalExp = tDiesel + tSal + tMaint + tOther + tAdd;
      const gTotalRem = tCol - gTotalExp;

      doc.font('Helvetica-Bold').fontSize(14).text('REPORT SUMMARY');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Total Collection: Rs ${tCol}`);
      doc.text(`Total Diesel Expense: Rs ${tDiesel}`);
      doc.text(`Total Salary Expense: Rs ${tSal}`);
      doc.text(`Total Maintenance Expense: Rs ${tMaint}`);
      doc.text(`Total Other Expense: Rs ${tOther}`);
      doc.text(`Total Additional Expenses: Rs ${tAdd}`);
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Grand Total Expense: Rs ${gTotalExp}`);
      doc.text(`Grand Total Remaining Collection: Rs ${gTotalRem}`);

    } else {
      // FLEET REPORT
      const buses = await prisma.bus.findMany();
      const dailies = await prisma.daily.findMany({
        where: { date: { gte: fromDate, lte: toDate } }
      });
      const expenses = await prisma.expense.findMany({
        where: { date: { gte: fromDate, lte: toDate } },
        include: { bus: true }
      });

      doc.fontSize(20).text('Bus Service Management System', { align: 'center' });
      doc.fontSize(14).text('FLEET REPORT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`From Date: ${fromDate.toLocaleDateString()}`);
      doc.text(`To Date: ${toDate.toLocaleDateString()}`);
      doc.moveDown();

      let gCol = 0, gDiesel = 0, gSal = 0, gMaint = 0, gOther = 0, gAdd = 0;

      const busRows = buses.map(bus => {
        const bDailies = dailies.filter(d => d.busId === bus.id);
        const bExps = expenses.filter(e => e.busId === bus.id);
        
        let bCol = 0, bExp = 0, bAdd = 0;
        
        bDailies.forEach(d => {
          const dSal = (d.driverSalaryExpense || 0) + (d.conductorSalaryExpense || 0);
          bCol += d.totalCollection;
          bExp += (d.dieselExpense || 0) + dSal + (d.maintenanceExpense || 0) + (d.otherExpense || 0);
          
          gCol += d.totalCollection;
          gDiesel += (d.dieselExpense || 0);
          gSal += dSal;
          gMaint += (d.maintenanceExpense || 0);
          gOther += (d.otherExpense || 0);
        });

        bExps.forEach(e => {
          bAdd += e.amount;
          gAdd += e.amount;
        });

        return [
          bus.registrationNumber,
          `Rs ${bCol}`,
          `Rs ${bExp}`,
          `Rs ${bAdd}`,
          `Rs ${bCol - (bExp + bAdd)}`
        ];
      });

      await doc.table({
        title: "BUS-WISE FINANCIAL SUMMARY",
        headers: ["Bus Number", "Collection", "Daily Expenses", "Additional Expenses", "Remaining"],
        rows: busRows.length > 0 ? busRows : [["-", "-", "-", "-", "-"]]
      }, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      });
      doc.moveDown();

      const gTotalExp = gDiesel + gSal + gMaint + gOther + gAdd;
      const gTotalRem = gCol - gTotalExp;

      doc.font('Helvetica-Bold').fontSize(14).text('FLEET TOTALS');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Total Collection: Rs ${gCol}`);
      doc.text(`Total Diesel Expense: Rs ${gDiesel}`);
      doc.text(`Total Salary Expense: Rs ${gSal}`);
      doc.text(`Total Maintenance Expense: Rs ${gMaint}`);
      doc.text(`Total Other Expense: Rs ${gOther}`);
      doc.text(`Total Additional Expenses: Rs ${gAdd}`);
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Grand Total Expense: Rs ${gTotalExp}`);
      doc.text(`Grand Total Remaining Collection: Rs ${gTotalRem}`);
    }

    doc.moveDown(2);
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Generated by Bus Service Management System - Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
