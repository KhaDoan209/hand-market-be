import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from 'src/domain/enums/roles.enum';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
   constructor(private readonly reflector: Reflector) { }
   canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
      if (!requiredRoles) {
         return true;
      }
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const hasRole = requiredRoles.some((role) => user.data.role === role);
      return hasRole;
   }
}