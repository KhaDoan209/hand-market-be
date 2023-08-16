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
   getMailHost(): any {
      return this.config.get<string>('MAIL_HOST')
   }
   getMailUser(): any {
      return this.config.get<string>('MAIL_USER')
   }
   getMailPassword(): any {
      return this.config.get<string>('MAIL_PASSWORD')
   }
   getMailFrom(): any {
      return this.config.get<string>('MAIL_FROM')
   }
   getStripeSecretKey(): any {
      return this.config.get<string>('STRIPE_SECRET_KEY')
   }
   getFrontEndURL(): any {
      return this.config.get<string>('FRONTEND_URL')
   }
   getMapBoxToken(): any {
      return this.config.get<string>('MAP_BOX_TOKEN')
   }
}