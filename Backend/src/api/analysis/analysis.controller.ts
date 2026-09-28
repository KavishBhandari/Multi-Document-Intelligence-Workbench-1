import { Request, Response } from 'express';
import { AnalysisService } from './analysis.service';
import { ResponseHelper } from '../../helper/responseHelper';
import { messages, statusCode } from '../../utils/contant';

export class AnalysisController {
  static async analyze(req: Request, res: Response) {
    const sessionId = parseInt(req.params.sessionId as string, 10);
    const { prompt } = req.body;
    const result = await AnalysisService.runAnalysis(sessionId, prompt);
    return ResponseHelper.sendSuccessRes(res, messages.ANALYSIS_COMPLETED, statusCode.SUCCESS, result);
  }

  static async getResult(req: Request, res: Response) {
    const sessionId = parseInt(req.params.sessionId as string, 10);
    const result = await AnalysisService.getSessionResult(sessionId);
    return ResponseHelper.sendSuccessRes(res, messages.ANALYSIS_RESULT_FETCHED, statusCode.SUCCESS, result);
  }

  static async exportResult(req: Request, res: Response) {
    const sessionId = parseInt(req.params.sessionId as string, 10);
    const result = await AnalysisService.getSessionResult(sessionId);
    if (!result.result) {
      return ResponseHelper.sendErrorRes(res, 'No analysis result available to export', statusCode.NOT_FOUND);
    }

    const format = req.query.format as string;
    if (format === 'markdown') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="analysis-session-${sessionId}.md"`);
      return res.send(result.result.markdownExport);
    }

    return ResponseHelper.sendSuccessRes(res, 'Export retrieved successfully', statusCode.SUCCESS, {
      session: result.session,
      result: result.result,
    });
  }
}
