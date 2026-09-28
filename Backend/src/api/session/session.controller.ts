import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { ResponseHelper } from '../../helper/responseHelper';
import { messages, statusCode } from '../../utils/contant';

export class SessionController {
  static async create(req: Request, res: Response) {
    const { prompt } = req.body;
    const session = await SessionService.createSession(prompt);
    return ResponseHelper.sendSuccessRes(res, messages.SESSION_CREATED, statusCode.CREATED, session);
  }

  static async getAll(req: Request, res: Response) {
    const sessions = await SessionService.getAllSessions();
    return ResponseHelper.sendSuccessRes(res, messages.SESSIONS_FETCHED, statusCode.SUCCESS, sessions);
  }

  static async getById(req: Request, res: Response) {
    const sessionId = parseInt(req.params.id as string, 10);
    const session = await SessionService.getSessionById(sessionId);
    return ResponseHelper.sendSuccessRes(res, messages.SESSION_FETCHED, statusCode.SUCCESS, session);
  }

  static async updatePrompt(req: Request, res: Response) {
    const sessionId = parseInt(req.params.id as string, 10);
    const { prompt } = req.body;
    const session = await SessionService.updateSessionPrompt(sessionId, prompt);
    return ResponseHelper.sendSuccessRes(res, 'Session prompt updated successfully', statusCode.SUCCESS, session);
  }

  static async delete(req: Request, res: Response) {
    const sessionId = parseInt(req.params.id as string, 10);
    const result = await SessionService.deleteSession(sessionId);
    return ResponseHelper.sendSuccessRes(res, 'Session deleted successfully', statusCode.SUCCESS, result);
  }
}
