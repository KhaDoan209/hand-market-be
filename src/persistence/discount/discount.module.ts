import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from '../../usecase/discount.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [DiscountController],
  providers: [DiscountService]
})
export class DiscountModule { }
