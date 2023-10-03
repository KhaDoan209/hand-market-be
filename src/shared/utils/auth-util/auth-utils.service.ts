import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthUtilService {
   constructor() {

   }
   public getTokenFromHeader(req: Request): string {
      const token = req.headers.authorization;
      const bearerPrefix = 'Bearer ';
      if (token && token.startsWith(bearerPrefix)) {
         return token.substring(bearerPrefix.length);
      }
      return null;
   }

   public getDecodedToken(token: string, jwtSecret: string): any {
      try {
         if (token !== null) {
            const decodedToken: any = jwt.verify(token, jwtSecret);
            return decodedToken;
         } else {
            return null;
         }
      } catch (error) {
         return null;
      }
   }

   public verifyToken(token: string, jwtSecret: string): any {
      try {
         if (token !== null) {
            return jwt.verify(token, jwtSecret);
         } else {
            return null;
         }
      } catch (error) {
         throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED)
      }
   }
   public getMethodFromRequest(req: Request): string {
      const method = req.method
      return method
   }

   public getBodyFromRequest(req: Request): any {
      return req.body
   }

}
