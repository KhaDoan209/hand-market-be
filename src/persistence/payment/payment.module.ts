import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from '../../usecase/payment.controller';
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
@Module({
  imports: [StripeModule, PrismaModule],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule { }
