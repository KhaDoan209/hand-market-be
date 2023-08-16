import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import { Request } from 'express';
@Injectable()
export class JwtStrategyService extends
   PassportStrategy(Strategy, "Jwt") {
   private static extractJWTFromCookie(req: Request): string | null {
      if (req.cookies && req.cookies.access_token) {
         return req.cookies.access_token;
      }
      return null;
   }

   constructor(config: EnvironmentConfigService) {
      super({
         jwtFromRequest:
            ExtractJwt.fromExtractors([
               JwtStrategyService.extractJWTFromCookie,
            ]),
         ignoreExpiration: false,
         secretOrKey: config.getJwtSecret(),
         algorithm: "HS256"
      });
   }

   async validate(token: any) {
      return token;
   }
}