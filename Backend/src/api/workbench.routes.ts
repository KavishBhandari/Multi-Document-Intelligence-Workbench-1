import { Router } from 'express';
import { WorkbenchController } from './workbench.controller';
import { upload } from '../middleware/upload';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.post('/upload', upload.array('files', 10), catchAsync(WorkbenchController.upload));

router.post('/evaluate/:sessionId', catchAsync(WorkbenchController.evaluate));
router.post('/evaluate', catchAsync(WorkbenchController.evaluate));
//router.get('/evaluate/:sessionId', catchAsync(WorkbenchController.evaluate));

export default router;
