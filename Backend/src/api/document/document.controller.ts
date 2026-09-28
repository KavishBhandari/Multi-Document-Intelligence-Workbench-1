import { Request, Response } from 'express';
import { DocumentService } from './document.service';
import { ResponseHelper } from '../../helper/responseHelper';
import { messages, statusCode } from '../../utils/contant';

export class DocumentController {
  static async upload(req: Request, res: Response) {
    const sessionId = parseInt(req.params.sessionId as string, 10);
    const files = req.files as Express.Multer.File[];
    const result = await DocumentService.uploadAndProcessDocuments(sessionId, files);
    return ResponseHelper.sendSuccessRes(res, messages.DOCUMENTS_UPLOADED, statusCode.SUCCESS, result);
  }

  static async getBySession(req: Request, res: Response) {
    const sessionId = parseInt(req.params.sessionId as string, 10);
    const documents = await DocumentService.getDocumentsBySession(sessionId);
    return ResponseHelper.sendSuccessRes(res, 'Documents retrieved successfully', statusCode.SUCCESS, documents);
  }

  static async getChunks(req: Request, res: Response) {
    const documentId = parseInt(req.params.id as string, 10);
    const data = await DocumentService.getDocumentChunks(documentId);
    return ResponseHelper.sendSuccessRes(res, 'Document chunks retrieved successfully', statusCode.SUCCESS, data);
  }

  static async delete(req: Request, res: Response) {
    const documentId = parseInt(req.params.id as string, 10);
    const result = await DocumentService.deleteDocument(documentId);
    return ResponseHelper.sendSuccessRes(res, 'Document deleted successfully', statusCode.SUCCESS, result);
  }
}
