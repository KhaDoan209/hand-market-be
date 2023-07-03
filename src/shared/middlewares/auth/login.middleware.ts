import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthLoginDTO } from 'src/application/dto/auth.dto';
import { PrismaClient } from '@prisma/client';
import { AuthUtilService } from 'src/shared/utils/auth-util/auth-utils.service';

import * as bcrypt from 'bcrypt'
@Injectable()
export class LoginMiddlweare implements NestMiddleware {
   constructor(
      private readonly authUtil: AuthUtilService) {
   }
   async use(request: Request, response: Response, next: NextFunction) {
      const authRegisterDto = plainToClass(AuthLoginDTO, request.body)
      const validateRegister = await validate(authRegisterDto)
      const prisma = new PrismaClient()
      if (validateRegister.length > 0) {
         return response.send(validateRegister)
      } else {
         const { email, password } = await this.authUtil.getBodyFromRequest(request)
         const findUserByEmail = await prisma.user.findFirst({
            where: {
               email
            }
         })
         if (findUserByEmail) {
            const isMatched = await bcrypt.compare(password, findUserByEmail.password)
            if (isMatched) {
               if (findUserByEmail.is_banned == true) {
                  throw new HttpException('Your account is banned, please contact admin', HttpStatus.FORBIDDEN);
               } else {
                  next()
               }
            } else {
               throw new HttpException('Password is wrong', HttpStatus.FORBIDDEN);
            }
         } else {
            throw new HttpException('Email is not registered', HttpStatus.NOT_FOUND);
         }
      }
   }
}