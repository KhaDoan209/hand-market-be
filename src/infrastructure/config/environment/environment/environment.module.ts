import { Global } from "@nestjs/common/decorators";
import { Module, DynamicModule } from '@nestjs/common';
import { EnvironmentConfigService } from "./environment.service";
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
   imports: [ConfigModule],
   providers: [EnvironmentConfigService, ConfigService],
   exports: [EnvironmentConfigService]
})

export class EnvironmentConfigModule {
   static register(): DynamicModule {
      return {
         module: EnvironmentConfigModule,
         providers: [EnvironmentConfigService],
         exports: [EnvironmentConfigService],
      };
   }
}