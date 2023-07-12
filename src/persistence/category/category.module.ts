import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from '../../usecase/category.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule { }
