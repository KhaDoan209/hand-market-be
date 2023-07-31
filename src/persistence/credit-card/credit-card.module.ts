import { Module } from '@nestjs/common';
import { CreditCardController } from '../../usecase/credit-card.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';
@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [CreditCardController],
})
export class CreditCardModule { }
