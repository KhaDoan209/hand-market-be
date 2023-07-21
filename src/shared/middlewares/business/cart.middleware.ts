import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import { Role } from 'src/domain/enums/roles.enum';
import { AuthUtilService } from 'src/shared/utils/auth-util/auth-utils.service';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
@Injectable()
export class CartMiddleware implements NestMiddleware {
   constructor(private readonly configService: EnvironmentConfigService, private readonly authUtil: AuthUtilService,
      private readonly prismaService: PrismaService,) {
   }
   use(request: Request, response: Response, next: NextFunction) {
      const { access_token } = request.cookies
      const userIdToOperate = Number(request.params.user_id)
      if (userIdToOperate) {
         try {
            const decodedToken = this.authUtil.getDecodedToken(access_token, this.configService.getJwtSecret())
            const { id, role } = decodedToken.data
            if (role === Role.Admin) {
               next();
            } else {
               if (role === Role.User && id == userIdToOperate) {
                  next();
               }
               else {
                  return response.status(403).json({ message: 'You have no permission on other user\'s account', status: 403, error: "Forbidden" });
               }
            }
         } catch (error) {
            return response.status(403).json({ message: 'Invalid Token', status: 403, error: "Forbidden" });
         }
      } else {
         return next()
      }
   }
}
