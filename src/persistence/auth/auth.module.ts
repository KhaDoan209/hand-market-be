import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from 'src/usecase/auth.controller';
import { PrismaModule } from '../../infrastructure/config/prisma/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategyService } from 'src/infrastructure/common/jwt/jwtStrategy.service';
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';
import { EventGatewayModule } from 'src/websocket/socket.module';
@Module({
  imports: [PrismaModule, JwtModule.register({
    global: true
  }), StripeModule, EventGatewayModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategyService]
})
export class AuthModule { }
