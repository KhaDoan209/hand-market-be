import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from '../../usecase/notification.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { EventGateway } from '../../websocket/event.gateway';
@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, EventGateway],
  exports: [NotificationService, EventGateway]
})
export class NotificationModule { }
