import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from 'src/domain/enums/roles.enum';
import { Reflector } from '@nestjs/core';
import { AuthUtilService } from 'src/shared/utils/auth-util/auth-utils.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RoleGuard implements CanActivate {
   constructor(private readonly reflector: Reflector) {
   }
   canActivate(context: ExecutionContext): boolean {
      const authUtil = new AuthUtilService();
      const config = new ConfigService();
      const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
      if (!requiredRoles) {
         return true;
      }
      const request = context.switchToHttp().getRequest();
      if (request.cookies.access_token !== undefined) {
         const decodedToken = authUtil.getDecodedToken(request.cookies.access_token, config.get('SECRET_KEY'))
         const hasRole = requiredRoles.some((role) => role == decodedToken.data.role);
         return hasRole;
      }
   }
}