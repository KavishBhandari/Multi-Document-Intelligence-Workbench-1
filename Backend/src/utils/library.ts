import fsPromise from "fs/promises";
import fs from "fs";
import path from "path";
import express, {
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction as ExpressNextFunction
} from "express";
//import joi from "joi";
import dotenv from "dotenv";


const app: express.Application = express();

const db: { [key: string]: any } = {};

const secretOrKey: string =
    process.env.SECRET_OR_KEY ||
    "your-secret-key-here-for-production-environment";

export type Request = ExpressRequest;
export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;


export const library = {
    fs,
    fsPromise,
    path,
    express,
    //joi,
    dotenv,
    app,
    db
};