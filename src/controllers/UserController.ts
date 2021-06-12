import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcryptjs";
import * as yup from 'yup';

import { User } from "../models/User";
import { UsersRepository } from "../repositories/UsersRepository";
import { AppError } from "../errors/appError";

class UserController {
   async list (req: Request, res: Response) {
      let { page } = req.params;

      Number(page) <= 0 ? page = '1' : page = page;

      const usersRepository = getCustomRepository(UsersRepository);

      const users = await usersRepository.find({ 
         select: ["id", "name", "email", "admin"],
         order: { created_at: 'ASC' },
         skip: (Number(page)-1)*5,
         take: 5
      });
      
      return res.json({ users });
   }

   async create (req: Request, res: Response) {
      const { email, password, confirmPassword, admin, name } = req.body;

      const schema = yup.object().shape({
         name: yup.string().required("Name is required"),
         email: yup.string().email("Email is not valid").required("Email is required"),
         password: yup.string().required("Password is required").min(6),
         confirmPassword: yup.string().required("Confirm password is required"),
         admin: yup.boolean()
      })

      try {
         await schema.validate(req.body);
      } catch (err) {
         throw new AppError(err.errors, 401);
      }

      const usersRepository = getCustomRepository(UsersRepository);

      if (password !== confirmPassword){
         throw new AppError("Password does not equal!")
      }

      const userAlreadyExists = await usersRepository.findOne({ email });

      if (userAlreadyExists) {
         throw new AppError("user already exists!");
      }

      const passwordHash = hashSync(password, 10);

      const user = usersRepository.create({ name, email, password: passwordHash, admin });
      
      await usersRepository.save(user);

      return res.json(user);
   }

   async update (req: Request, res: Response) {
      const { id, name, email, newPassword, confirmNewPassword } = req.body;

      const schema = yup.object().shape({
         name: yup.string().min(6, "Name required more than 6 characters"),
         email: yup.string().email("Email is not valid").required("Email is required"),
         newPassword: yup.string(),
         confirmNewPassword: yup.string().when('newPassword', (newPassword: String, field: any) => 
            newPassword ? field.required("Confirm password is required") : field
         ),
      })

      try {
         await schema.validate(req.body);
      } catch (err) {
         throw new AppError(err.errors, 401);
      }

      if (newPassword && newPassword !== confirmNewPassword) {
         throw new AppError("Password and Confirm Password does not match");
      }

      const usersRepository = getCustomRepository(UsersRepository);

      const userAlreadyExists = await usersRepository.findOne({ where: { id } }) 

      if (!userAlreadyExists) {
         throw new AppError("User does not exists");
      }

      if (newPassword) {
         await usersRepository.createQueryBuilder()
            .update(User)
            .set({ password: hashSync(newPassword, 10) })
            .where("id = :id", {
               id
            }).execute();
         ;          
      }
      
      if (name !== "" && name !== null) {
         await usersRepository.createQueryBuilder()
            .update(User)
            .set({ name })
            .where("id = :id", {
               id
            }).execute();
         ;    
      }

      if (email && userAlreadyExists.email !== email) {
         const emailAlreadyExists = await usersRepository.findOne({ email });

         if (emailAlreadyExists){
            throw new AppError("Email already in use");
         }

         await usersRepository.createQueryBuilder()
            .update(User)
            .set({ email })
            .where("id = :id", {
               id
            }).execute();
         ;   
      }

      return res.json({ message: "User updated!" });
   }

   async delete (req: Request, res: Response) {
      const { user_id } = req.params;
   
      const usersRepository = getCustomRepository(UsersRepository);

      const userAlreadyExists = await usersRepository.findOne({ id: user_id });

      if (!userAlreadyExists) {
         throw new AppError("User does not exists");
      }

      await usersRepository.delete({ id: user_id });

      return res.json({ msg: "Deleted!" });
   }  
}

export { UserController }