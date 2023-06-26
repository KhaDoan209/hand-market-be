import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthUtilService } from 'src/shared/utils/auth-util/auth-utils.service';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import { AuthService } from 'src/persistence/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { calculateRemainingTime } from 'src/shared/utils/custom-functions/custom-token';
@Injectable()
export class ResetTokenMiddleware implements NestMiddleware {
   constructor(
      private readonly authUtil: AuthUtilService,
      private readonly configService: EnvironmentConfigService,
      private readonly prismaService: PrismaService,
      private readonly jwtService: JwtService
   ) {
   }
   async use(request: Request, response: Response, next: NextFunction) {
      const { access_token, refresh_token } = request.cookies
      const decodedToken = this.authUtil.getDecodedToken(access_token, this.configService.getJwtSecret())
      const decodedRefreshToken = this.authUtil.getDecodedToken(refresh_token, this.configService.getRefreshSecret())
      if (decodedRefreshToken !== null) {
         if (calculateRemainingTime(decodedToken) <= 1 || decodedToken === null) {
            const authService = new AuthService(this.prismaService, this.jwtService, this.configService)
            let data = await authService.refresh(refresh_token)
            response.cookie('access_token', data.access_token, { httpOnly: true, expires: new Date(Date.now() + 30 * 60 * 1000), });
            return next()
         } else {
            return next()
         }
      } else {
         return response.status(401).json({ message: 'Login session has expired' });
      }

   }
}