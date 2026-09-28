import { Sequelize } from 'sequelize';

export {};

declare global {
  namespace Express {
    interface Request {
      transaction?: Sequelize.Transaction;
       file?: Express.Multer.File;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser; 
  }
};