import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from 'src/usecase/auth.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import * as jwt from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, jwt.JwtModule.register({
    global: true
  })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
