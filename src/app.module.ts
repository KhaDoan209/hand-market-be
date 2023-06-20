import { Module } from '@nestjs/common';
import { EnvironmentConfigModule } from './infrastructure/config/environment/environment/environment.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [PersistenceModule, EnvironmentConfigModule.register()],
})
export class AppModule { }
