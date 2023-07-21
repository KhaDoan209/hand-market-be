import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from '../../usecase/order.controller';
import { PrismaModule } from '../../infrastructure/config/prisma/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule { }
