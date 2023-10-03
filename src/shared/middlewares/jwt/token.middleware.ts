import { Injectable, NestMiddleware, MiddlewareConsumer } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenAuthMiddleware implements NestMiddleware {
   constructor(
      private readonly configService: EnvironmentConfigService,
   ) { }
   configure(consumer: MiddlewareConsumer) {
   }
   use(request: Request, response: Response, next: NextFunction) {
      const token = request.headers.authorization?.split(' ')[1];
      if (token) {
         try {
            const decoded = jwt.verify(token, this.configService.getJwtSecret());
            request.user = decoded;
            next()
         } catch (error) {
            response.status(401).json({ message: 'Unauthorized' });
         }
      } else {
         response.status(401).json({ message: 'Thiếu access token' });
      }
   }
}