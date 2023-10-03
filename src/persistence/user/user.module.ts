import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from '../../usecase/user.controller';
import { PrismaModule } from '../../infrastructure/config/prisma/prisma/prisma.module'
import { CloudinaryModule } from 'src/infrastructure/common/cloudinary/cloudinary.module';
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';
@Module({
  imports: [PrismaModule, CloudinaryModule, StripeModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }
