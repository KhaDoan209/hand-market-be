import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from 'src/usecase/auth.controller';
import { PrismaModule } from '../../infrastructure/config/prisma/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategyService } from 'src/infrastructure/common/jwtStrategy.service';
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';

@Module({
  imports: [PrismaModule, JwtModule.register({
    global: true
  }), StripeModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategyService]
})
export class AuthModule { }
