import { PaymentService } from '../persistence/payment/payment.service';
import {
  Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query, HttpStatus, UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { CreateChargeDTO } from 'src/application/dto/stripe.dto';
import { StripeService } from 'src/infrastructure/common/stripe/stripe.service';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService, private readonly stripe: StripeService) { }

  // @Post('/setup-payment-intent')

  // @Post('/create-payment-intent/:customerId')
  // async createPaymentIntent(@Body() charge: CreateChargeDTO, @Param('id') customerId: string) {
  //   console.log(charge)
  //   let data = await this.stripe.createPaymentIntent(charge.amount, customerId)
  //   return data
  // }

  @Delete('/cancel-payment-intent/:paytmentId')
  async cancelPaymentIntent(@Param('paytmentId') paytmentId: string) {
    let data = await this.stripe.cancelPaymentIntent(paytmentId)
    return data
  }


}
