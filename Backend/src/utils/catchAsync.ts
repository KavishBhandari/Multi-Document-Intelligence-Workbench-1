
import { ResponseHelper } from "../helper/responseHelper";
import { NextFunction, Request, Response } from "./library";

export default function catchAsync(fn: CallableFunction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
      .then(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        req.transaction && (await req.transaction.commit());
      })
      .catch(async (error) => {
       
       console.error("catchAsync error :: ", error);
      
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        req.transaction && (await req.transaction.rollback());
        
        return ResponseHelper.sendErrorRes(
          res,
          error.message || "Internal Server Error",
          error.statusCode || 500,
          {},
        );
      });
  };
}