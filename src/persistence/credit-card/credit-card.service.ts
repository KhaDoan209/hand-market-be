import { Injectable } from '@nestjs/common';
import { CreateCreditCardDTO } from 'src/application/dto/credit-card.dto';
import { CreditCardRepository } from 'src/application/repositories/business/credit-card.repository';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
@Injectable()
export class CreditCardService implements CreditCardRepository {
  constructor(private readonly prisma: PrismaService) {

  }
  async createNewCard(userId: number, paymentMethodId: string): Promise<any> {
    return await this.prisma.usePrisma().creditCard.create({
      data: {
        user_id: userId,
        payment_method_id: paymentMethodId
      }
    })
  }
}
