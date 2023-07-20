import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from '../../usecase/product.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { CloudinaryModule } from 'src/infrastructure/common/cloudinary/cloudinary.module';
@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule { }