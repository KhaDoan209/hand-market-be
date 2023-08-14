import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from '../../usecase/order.controller';
import { PrismaModule } from '../../infrastructure/config/prisma/prisma/prisma.module'
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';
import { NotificationModule } from '../notification/notification.module';
import { EventGatewayModule } from 'src/websocket/socket.module';
@Module({
  imports: [PrismaModule, StripeModule, NotificationModule, EventGatewayModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule { }
