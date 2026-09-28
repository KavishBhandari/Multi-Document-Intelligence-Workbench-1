import { Router } from 'express';
import workbenchRoutes from './workbench.routes';

const router = Router();


router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Multi-Document Intelligence Workbench API',
    endpoints: [
      'POST /api/upload (Upload documents + prompt)',
      'POST /api/evaluate/:sessionId (Evaluate documents and generate insights)',
    ],
    timestamp: new Date().toISOString(),
  });
});


router.use('/', workbenchRoutes);

export default router;
