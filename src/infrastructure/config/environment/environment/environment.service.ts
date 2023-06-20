import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class EnvironmentConfigService {
   constructor(private readonly config: ConfigService) {
   }
   getJwtSecret(): string {
      return this.config.get<string>('SECRET_KEY')
   }
}