import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import busRoutes from './routes/buses';
import driverRoutes from './routes/drivers';
import tripRoutes from './routes/trips';
import dailyRoutes from './routes/dailies';
import conductorRoutes from './routes/conductors';
import reportRoutes from './routes/reports';
import analyticsRoutes from './routes/analytics';
import expenseRoutes from './routes/expenses';
import winston from 'winston';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Logging setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/conductors', conductorRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/dailies', dailyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
