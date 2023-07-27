import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import { Role } from 'src/domain/enums/roles.enum';
import { AuthUtilService } from 'src/shared/utils/auth-util/auth-utils.service';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { PrismaEnum } from 'src/domain/enums/prisma.enum';
@Injectable()
export class ProductMiddleware implements NestMiddleware {
   constructor(private readonly configService: EnvironmentConfigService, private readonly authUtil: AuthUtilService,
      private readonly prismaService: PrismaService,) {
   }
   async use(request: Request, response: Response, next: NextFunction) {
      const { access_token } = request.cookies
      const productIdFromReq = Number(request.params.id)
      const isProductExist = await this.prismaService.findOne(PrismaEnum.Product, productIdFromReq)
      const decodedToken = await this.authUtil.getDecodedToken(access_token, this.configService.getJwtSecret())
      const { role } = decodedToken.data
      if (role == Role.Admin) {
         if (isProductExist) {
            next();
         } else {
            return response.status(404).json({ message: 'Not Found', status: 404, error: "Not Found" });
         }
      } else {
         return response.status(403).json({ message: 'Invalid Token', status: 403, error: "Forbidden" });
      }
   }
}
