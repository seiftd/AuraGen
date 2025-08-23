import { Router, Request, Response } from 'express';
import { database } from '@/config/database';
import config from '@/config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    version: '1.0.0',
    services: {
      database: database.isHealthy() ? 'Connected' : 'Disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    }
  };

  const statusCode = database.isHealthy() ? 200 : 503;
  
  res.status(statusCode).json(healthCheck);
});

export default router;