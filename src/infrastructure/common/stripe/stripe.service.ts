import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import { CreateCreditCardDTO } from 'src/application/dto/credit-card.dto';
import { Address, User } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderStatus } from 'src/domain/enums/order-status.enum';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(private readonly environmentConfigService: EnvironmentConfigService, private readonly mailService: MailerService) {
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

  public async createPaymentIntent(amount: number, customerId: string, cardId: string, shippingAddress: Address, user: User, order_code: string) {
    const { last4 }: any = await this.stripe.customers.retrieveSource(customerId, cardId)
    const charge = await this.stripe.paymentIntents.create({
      amount,
      customer: customerId,
      payment_method_types: ['card'],
      payment_method: cardId,
      currency: 'vnd',
      confirm: true,
      receipt_email: user.email,
      shipping: {
        name: user.first_name.trim() + user.last_name.trim(),
        address: {
          line1: shippingAddress.street.trim(),
          line2: shippingAddress.ward.trim() + shippingAddress.district.trim(),
          city: shippingAddress.province.trim(),
          country: 'VN'
        },
        phone: user.phone
      },
      description: `Receipt for order ${order_code}`
    })
    if (charge.status === "succeeded") {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Thank you for your order!',
        template: './confirmation',
        context: {
          customerName: `${user.first_name} ${user.last_name}`,
          orderCode: `${order_code}`,
          amount: `${amount.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}`,
          email: `${user.email}`,
          shippingAddress: `${shippingAddress.street}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.province}`,
          phoneNumber: `${user.phone}`,
          last4CardPayment: `${last4}`
        },
      })
      const orderStatus = {
        status: charge.status,
        payment_status: OrderStatus.Paid
      }
      return orderStatus
    }
  }

  public async cancelPaymentIntent(id: string) {
    return await this.stripe.paymentIntents.cancel(id)
  }

}
