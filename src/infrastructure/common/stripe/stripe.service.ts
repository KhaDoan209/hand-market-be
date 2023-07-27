import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import { CreateCreditCardDTO } from 'src/application/dto/credit-card.dto';
@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(private readonly environmentConfigService: EnvironmentConfigService) {
    this.stripe = new Stripe(environmentConfigService.getStripeSecretKey(), {
      apiVersion: '2022-11-15'
    })
  }

  public async createStripeCustomer(first_name: string, last_name: string, email: string) {
    let name = first_name + last_name
    return this.stripe.customers.create({
      name,
      email,
    },);
  }

  public async getStripeCustomerDetail(id: string) {
    return this.stripe.customers.retrieve(id)
  }

  public async deleteStripeCustomer(id: string) {
    return this.stripe.customers.del(id);
  }

  public async createNewCard(body: CreateCreditCardDTO) {
    const { card_token, customer_stripe_id } = body
    const card = await this.stripe.customers.createSource(customer_stripe_id, { source: card_token })
    return card
  }

  public async getSavedCard(customerStripeId: string) {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerStripeId,
      type: 'card',
    });
    const savedCards = paymentMethods.data.map((pm) => ({
      card_id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
      fingerprint: pm.card.fingerprint,
    }));
    return savedCards
  }

  public async deleteSavedCard(customerStripeId: string, cardId: string) {
    const paymentMethod = await this.stripe.customers.deleteSource(customerStripeId, cardId)
    return paymentMethod
  }

  public async createPaymentIntent(amount: number, customerId: string) {
    return this.stripe.paymentIntents.create({
      amount,
      customer: customerId,
      // off_session:true,
      // payment_method: paymentMethodId,
      currency: 'vnd',
      // confirm: true

    })
  }

  public async cancelPaymentIntent(id: string) {
    return await this.stripe.paymentIntents.cancel(id)
  }

}
