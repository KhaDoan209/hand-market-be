import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query } from '@nestjs/common';
import { CreditCardService } from '../persistence/credit-card/credit-card.service';
import { StripeService } from 'src/infrastructure/common/stripe/stripe.service';
import { CreateCreditCardDTO } from 'src/application/dto/credit-card.dto';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';

@Controller('credit-card')
export class CreditCardController {
  constructor(private readonly creditCardService: CreditCardService,
    private readonly stripe: StripeService) { }

  @Get('get-list-saved-card/:id')
  async getListSavedCards(@Param('id') customerStripeId: string) {
    const result = await this.stripe.getSavedCard(customerStripeId)
    return result
  }

  @Post('add-new-card/:id')
  async createNewCard(@Body() body: CreateCreditCardDTO, @Param('id') userId: number) {
    const { id } = await this.stripe.createNewCard(body)
    await this.creditCardService.createNewCard(+userId, id)
    return customResponse(null, HttpStatus.CREATED, 'New card added')
  }

  @Delete('delete-saved-card')
  async deleteSavedCard(@Query() query: any) {
    const { cardId, customerStripeId } = query
    const result = await this.stripe.deleteSavedCard(customerStripeId, cardId)
    return result
  }

}
