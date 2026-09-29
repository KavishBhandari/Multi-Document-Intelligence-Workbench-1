import { Request, Response } from 'express';
import { WorkbenchService } from './workbench.service';
import { ResponseHelper } from '../helper/responseHelper';
import { statusCode } from '../utils/contant';

export class WorkbenchController {
 
  static async upload(req: Request, res: Response) {
    const prompt = req.body.prompt;
    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    const result = await WorkbenchService.uploadAndIngest(prompt, files);
    return ResponseHelper.sendSuccessRes(
      res,
      'Documents uploaded and ingested successfully. Ready for evaluation.',
      statusCode.CREATED,
      result
    );
  }

  
  static async evaluate(req: Request, res: Response) {
    const sessionIdParam = req.params.sessionId || req.body.sessionId;
    const sessionId = parseInt(sessionIdParam as string, 10);
    const promptOverride = req.body.prompt;

    const result = await WorkbenchService.evaluate(sessionId, promptOverride);
    return ResponseHelper.sendSuccessRes(
      res,
      'Document evaluation completed successfully.',
      statusCode.SUCCESS,
      result
    );
  }
}
