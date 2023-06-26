import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from '../../usecase/user.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }
