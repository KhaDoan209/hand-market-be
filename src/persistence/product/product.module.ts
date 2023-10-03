import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from '../../usecase/product.controller';
import { PrismaModule } from '../../infrastructure/config/prisma/prisma/prisma.module'
import { CloudinaryModule } from 'src/infrastructure/common/cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';
@Module({
  imports: [PrismaModule, CloudinaryModule, NotificationModule],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule { }
