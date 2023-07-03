import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { EnvironmentConfigModule } from './infrastructure/config/environment/environment/environment.module';
import { PersistenceModule } from './persistence/persistence.module';
import { RegisterMiddleware } from './shared/middlewares/auth/register.middleware';
import { ResetTokenMiddleware } from './shared/middlewares/auth/reset-token.middleware';
import { AuthUtilsModule } from './shared/utils/auth-util/auth-utils.module';
import { HttpModule } from '@nestjs/axios'
import { PrismaModule } from './infrastructure/config/prisma/prisma/prisma.module';
import { LoginMiddlweare } from './shared/middlewares/auth/login.middleware';
import * as redisStore from 'cache-manager-redis-store'
import { CacheModule } from '@nestjs/cache-manager';
import { EventGateway } from './event.gateway';


@Module({
  imports: [PersistenceModule, EnvironmentConfigModule.register(), CacheModule.register({
    store: redisStore,
    ttl: 300,
    isGlobal: true,
  }), AuthUtilsModule, HttpModule, PrismaModule],
  providers: [EventGateway]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResetTokenMiddleware).exclude(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/register', method: RequestMethod.POST },
      { path: 'auth/logout/:id', method: RequestMethod.POST },
      { path: 'auth/check-existed-email', method: RequestMethod.GET }
    ).forRoutes('*')
    consumer.apply(LoginMiddlweare).forRoutes('auth/login')
    consumer.apply(RegisterMiddleware).forRoutes('auth/register')
  }
}
