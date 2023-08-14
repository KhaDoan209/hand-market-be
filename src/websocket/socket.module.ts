import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
@Module({
   imports: [PrismaModule],
   providers: [EventGateway],
   exports: [EventGateway],
})
export class EventGatewayModule { }
