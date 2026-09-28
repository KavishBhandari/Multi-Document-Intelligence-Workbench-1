import { Router } from 'express';
import { AnalysisController } from './analysis.controller';
import catchAsync from '../../utils/catchAsync';

const router = Router({ mergeParams: true });

router.post('/sessions/:sessionId/analyze', catchAsync(AnalysisController.analyze));
router.get('/sessions/:sessionId/result', catchAsync(AnalysisController.getResult));
router.get('/sessions/:sessionId/export', catchAsync(AnalysisController.exportResult));

export default router;
