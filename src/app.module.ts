import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { EnvironmentConfigModule } from './infrastructure/config/environment/environment/environment.module';
import { PersistenceModule } from './persistence/persistence.module';
import { RegisterMiddleware } from './shared/middlewares/business/register.middleware';
import { ResetTokenMiddleware } from './shared/middlewares/business/reset-token.middleware';
import { AuthUtilsModule } from './shared/utils/auth-util/auth-utils.module';
import { HttpModule } from '@nestjs/axios'
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module'
import { LoginMiddlweare } from './shared/middlewares/business/login.middleware';
import { UserMiddleware } from './shared/middlewares/business/user.middleware';
import { ProductMiddleware } from './shared/middlewares/business/product.middelware';
import * as redisStore from 'cache-manager-redis-store'
import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventGateway } from './event.gateway';
import { EnvironmentConfigService } from './infrastructure/config/environment/environment/environment.service';
import path, { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { OrderModule } from './persistence/order/order.module';
import { CartMiddleware } from './shared/middlewares/business/cart.middleware';

@Module({
  imports: [PersistenceModule, EnvironmentConfigModule.register(), CacheModule.register({
    store: redisStore,
    ttl: 300,
    isGlobal: true,
  }), AuthUtilsModule, HttpModule, PrismaModule, MailerModule.forRootAsync({
    imports: [EnvironmentConfigModule],
    useFactory: async (config: EnvironmentConfigService) => ({
      transport: {
        host: config.getMailHost(),
        port: 587,
        secure: false,
        ignoreTLS: false,
        auth: {
          user: config.getMailUser(),
          pass: config.getMailPassword()
        }
      },
      defaults: {
        from: `"Hand Market" <${config.getMailFrom()}>`
      },
      template: {
        dir: join(__dirname, 'src/templates/email'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
    }),
    inject: [EnvironmentConfigService]
  }), OrderModule],
  providers: [EventGateway]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResetTokenMiddleware).exclude(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/register', method: RequestMethod.POST },
      { path: 'auth/logout/:id', method: RequestMethod.POST },
      { path: 'auth/check-existed-email', method: RequestMethod.GET },
      { path: 'product/get-list-product', method: RequestMethod.GET },
      { path: 'product/get-product-detail/:id', method: RequestMethod.GET },
      { path: 'product/get-list-product-by-purchase', method: RequestMethod.GET },
      { path: 'product/get-list-product-by-discount', method: RequestMethod.GET },
      { path: 'category/get-list-category', method: RequestMethod.GET },
    ).forRoutes('*')
    consumer.apply(LoginMiddlweare).forRoutes('auth/login')
    consumer.apply(RegisterMiddleware).forRoutes('auth/register')
    consumer.apply(UserMiddleware).forRoutes(
      { path: 'user/update-user-infor/:id', method: RequestMethod.POST },
      { path: 'user/update-user-address/:id', method: RequestMethod.POST },
      { path: 'user/get-user-detail/:id', method: RequestMethod.GET },
      { path: 'user/change-password/:id', method: RequestMethod.PATCH },
      { path: 'user/upload-user-avatar/:id', method: RequestMethod.POST })
    consumer.apply(ProductMiddleware).forRoutes({
      path: 'product/update-product-information/:id', method: RequestMethod.POST
    }, {
      path: 'product/upload-product-image/:id', method: RequestMethod.POST
    }, {
      path: 'product/delete-product/:id', method: RequestMethod.POST
    })
    consumer.apply(CartMiddleware).forRoutes(
      { path: 'cart/get-item-by-user/:user_id', method: RequestMethod.GET }
    )
  }
}

