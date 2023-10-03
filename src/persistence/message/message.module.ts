import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from '../../usecase/message.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { EventGatewayModule } from 'src/websocket/socket.module';

@Module({
  imports: [PrismaModule, EventGatewayModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule { }
