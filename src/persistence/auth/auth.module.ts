import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from 'src/usecase/auth.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategyService } from 'src/infrastructure/common/jwtStrategy.service';
@Module({
  imports: [PrismaModule, JwtModule.register({
    global: true
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategyService]
})
export class AuthModule { }
