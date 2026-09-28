import { Router } from 'express';
import { SessionController } from './session.controller';
import catchAsync from '../../utils/catchAsync';

const router = Router();

router.post('/', catchAsync(SessionController.create));
router.get('/', catchAsync(SessionController.getAll));
router.get('/:id', catchAsync(SessionController.getById));
router.patch('/:id/prompt', catchAsync(SessionController.updatePrompt));
router.delete('/:id', catchAsync(SessionController.delete));

export default router;
