import { Response } from 'express';
export const ResponseHelper = {
    sendSuccessRes(res: Response, message: string, statusCode: number = 200, data: object | object[] = {}) {
        return res.status(statusCode).send({
            success: true,
            message: message,
            data: data || {}
        });
    },

    sendErrorRes(res: Response, message: string, statusCode: number = 500, data: object | object[] = {}) {
        return res.status(statusCode).send({
            success: false,
            message: message,
            data: data || {}
        });
    }
};