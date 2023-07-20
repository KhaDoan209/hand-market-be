import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from '../../usecase/cart.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule { }
