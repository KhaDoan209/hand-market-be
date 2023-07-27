import { Module } from '@nestjs/common';
import { CreditCardService } from './credit-card.service';
import { CreditCardController } from '../../usecase/credit-card.controller';
import { PrismaModule } from 'src/infrastructure/config/prisma/prisma/prisma.module';
import { StripeModule } from 'src/infrastructure/common/stripe/stripe.module';
@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [CreditCardController],
  providers: [CreditCardService]
})
export class CreditCardModule { }
