import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from '../../usecase/user.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { CloudinaryModule } from 'src/infrastructure/common/cloudinary/cloudinary.module';
@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }
