import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from '../../usecase/order.controller';
import { PrismaModule } from '../../infrastructure/config/prisma/prisma/prisma.module'
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';
@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule { }
