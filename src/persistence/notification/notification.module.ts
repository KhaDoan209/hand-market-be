import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from '../../usecase/notification.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { EventGatewayModule } from 'src/websocket/socket.module';
@Module({
  imports: [PrismaModule, EventGatewayModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule { }
