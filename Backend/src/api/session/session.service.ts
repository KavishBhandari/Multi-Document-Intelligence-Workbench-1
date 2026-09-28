import AnalysisSession from '../../database/models/analysissession';
import Document from '../../database/models/document';
import AnalysisResult from '../../database/models/analysisresult';
import Finding from '../../database/models/finding';
import FindingEvidence from '../../database/models/findingevidence';
import { ApiError } from '../../utils/apiError';
import { statusCode, messages, SESSION_STATUS } from '../../utils/contant';

export class SessionService {
  static async createSession(prompt: string) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Analysis prompt is required and cannot be empty.');
    }

    const session = await AnalysisSession.create({
      prompt: prompt.trim(),
      status: SESSION_STATUS.CREATED,
    });

    return session;
  }

  static async getAllSessions() {
    const sessions = await AnalysisSession.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'original_name', 'mime_type', 'size_bytes', 'status', 'page_count'],
        },
      ],
    });

    return sessions;
  }

  static async getSessionById(sessionId: number) {
    const session = await AnalysisSession.findByPk(sessionId, {
      include: [
        {
          model: Document,
          as: 'documents',
          attributes: [
            'id',
            'original_name',
            'stored_name',
            'mime_type',
            'size_bytes',
            'sha256',
            'status',
            'error_code',
            'error_message',
            'page_count',
            'createdAt',
          ],
        },
        {
          model: AnalysisResult,
          as: 'results',
          include: [
            {
              model: Finding,
              as: 'findings',
              include: [
                {
                  model: FindingEvidence,
                  as: 'evidences',
                },
              ],
            },
          ],
        },
      ],
    });

    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    return session;
  }

  static async updateSessionPrompt(sessionId: number, prompt: string) {
    const session = await AnalysisSession.findByPk(sessionId);
    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    session.prompt = prompt.trim();
    await session.save();
    return session;
  }

  static async deleteSession(sessionId: number) {
    const session = await AnalysisSession.findByPk(sessionId);
    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    await session.destroy();
    return { id: sessionId, deleted: true };
  }
}
