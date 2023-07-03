import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthRegisterDTO } from 'src/application/dto/auth.dto';
import { PrismaClient } from '@prisma/client';
import { AuthUtilService } from 'src/shared/utils/auth-util/auth-utils.service';
@Injectable()
export class RegisterMiddleware implements NestMiddleware {
   constructor(
      private readonly authUtil: AuthUtilService) {
   }
   async use(request: Request, response: Response, next: NextFunction) {
      const authRegisterDto = plainToClass(AuthRegisterDTO, request.body)
      const validateRegister = await validate(authRegisterDto)
      const prisma = new PrismaClient()
      if (validateRegister.length > 0) {
         return response.send(validateRegister)
      } else {
         const { email } = await this.authUtil.getBodyFromRequest(request)
         const findUserByEmail = await prisma.user.findFirst({
            where: {
               email
            }
         })
         if (findUserByEmail) {
            return response.status(409).json({ message: "Email is existed", status: 409, error: "Conflict" })
         } else {
            next()
         }  
      }
   }
}