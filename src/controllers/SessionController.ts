import { compareSync } from "bcryptjs";
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/appError";
import { UsersRepository } from "../repositories/UsersRepository";
import jwt from "jsonwebtoken";
import * as yup from 'yup';

class SessionController {
   async create (req: Request, res: Response) {
      const { email, password } = req.body;

      const schema = yup.object().shape({
         email: yup.string().email("Email is not valid").required("Email is required"),
         password: yup.string().required("Password is required"),
      })

      try {
         await schema.validate(req.body);
      } catch (err) {
         throw new AppError(err.errors, 401);
      }

      const usersRepository = getCustomRepository(UsersRepository);

      const user = await usersRepository.findOne({
         select: ["id", "name", "email", "admin", "password"],
         where: { email }
      });
      
      if ( !user || !(compareSync(password, user.password))) {
         throw new AppError("incorrect password or email", 401);
      }

      const token = jwt.sign (
         { id: user.id, admin: user.admin, name: user.name, email: user.email }, 
         process.env.TOKEN_SECRET, 
         { expiresIn: 60 * 60 * 24 }
      );

      return res.json({token});
   }
}

export { SessionController } 