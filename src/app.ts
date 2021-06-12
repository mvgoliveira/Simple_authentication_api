import "reflect-metadata";
import "express-async-errors";
import { createConnection } from "typeorm";
import express, { NextFunction, Request, Response } from 'express';
import { router } from './routes';
import { AppError } from './errors/appError';
import cors from 'cors';

createConnection();
const app = express();

app.use(cors())
app.use(express.json());
app.use(router);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
   if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
   }

   return res.status(500).json({ 
      status: "Error",
      message: `Internal server error ${err.message}`,
   });
})

export { app }