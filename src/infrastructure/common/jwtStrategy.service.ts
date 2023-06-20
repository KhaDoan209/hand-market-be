import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EnvironmentConfigService } from '../config/environment/environment/environment.service';

@Injectable()
export class JwtStrategyService extends
   PassportStrategy(Strategy, "jwt") {
   constructor(config: EnvironmentConfigService) {
      super({
         jwtFromRequest:
            ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: config.getJwtSecret(),
         algorithm: "HS256"
      });
   }
   async validate(token: any) {
      return token;
   }


}