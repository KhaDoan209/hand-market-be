import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class EnvironmentConfigService {
   constructor(private readonly config: ConfigService) {
   }
   getJwtSecret(): any {
      return this.config.get<string>('SECRET_KEY')
   }
   getJwtExpired(): any {
      return this.config.get<string>('ACCESS_EXPIRED_IN')
   }
   getRefreshSecret(): any {
      return this.config.get<string>('REFRESH_SECRECT_KEY')
   }
   getRefreshExpired(): any {
      return this.config.get<string>('REFRESH_EXPIRED_IN')
   }
}