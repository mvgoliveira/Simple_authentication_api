import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError";
import jwt from "jsonwebtoken";

class Auth {
   async user(req: Request, res: Response, next: NextFunction) {
      let token = req.header('authorization');

      if (!token) {
         throw new AppError("Access Denied", 401);
      }

      token = token.slice(7); //remove baerer and /n
      
      try {
         jwt.verify(token, process.env.TOKEN_SECRET);
      } catch (err) {
         throw new AppError("Invalid token", 401);
      }

      next();
   }

   async admin(req: Request, res: Response, next: NextFunction) {
      let token = req.header('authorization');

      if (!token) {
         throw new AppError("Access Denied", 401);
      }

      token = token.slice(7); //remove baerer and /n

      try {
         const verify = jwt.verify(token, process.env.TOKEN_SECRET);
         
         if (verify.admin === false) {
            throw new AppError("Invalid token", 401);
         }

      } catch (err) {
         throw new AppError("Invalid token", 401);
      }   
      
      next();
   }
}

export { Auth }