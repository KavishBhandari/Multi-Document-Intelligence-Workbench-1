import { Router } from 'express';
import sessionRoutes from './session/session.routes';
import documentRoutes from './document/document.routes';
import analysisRoutes from './analysis/analysis.routes';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Multi-Document Intelligence Workbench API',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routes
router.use('/sessions', sessionRoutes);
router.use('/', documentRoutes);
router.use('/', analysisRoutes);

export default router;
