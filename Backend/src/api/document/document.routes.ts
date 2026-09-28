import { Router } from 'express';
import { DocumentController } from './document.controller';
import { upload } from '../../middleware/upload';
import catchAsync from '../../utils/catchAsync';

const router = Router({ mergeParams: true });

router.post('/sessions/:sessionId/documents', upload.array('files', 10), catchAsync(DocumentController.upload));
router.get('/sessions/:sessionId/documents', catchAsync(DocumentController.getBySession));
router.get('/documents/:id/chunks', catchAsync(DocumentController.getChunks));
router.delete('/documents/:id', catchAsync(DocumentController.delete));

export default router;
