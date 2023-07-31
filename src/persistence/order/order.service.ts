import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDTO } from 'src/application/dto/order.dto';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { OrderRepository } from 'src/application/repositories/business/order.repositiory';
import { customResponse, generateOrderId } from 'src/shared/utils/custom-functions/custom-response';
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
import { StripeService } from 'src/infrastructure/common/stripe/stripe.service';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class OrderService implements OrderRepository {
   constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService, private readonly mailService: MailerService) {
   }
   async getListOrderByUser(userId: number, pageNumber: number = 1, pageSize: number = 8,): Promise<any> {
      const totalRedcord = Math.ceil(await this.prisma.usePrisma().order.count({
         where: {
            user_id: userId
         }
      }))
      const listOrder = await this.prisma.usePrisma().order.findMany({
         where: {
            user_id: Number(userId)
         }, include: {
            User: true
         }
      })
      return getDataByPage(pageNumber, pageSize, totalRedcord, listOrder)
   }

   async createNewOrder(data: CreateOrderDTO): Promise<any> {
      try {
         const { order_total, user_id, product, card_id } = data;
         const today = new Date();
         const shippingAddress = await this.prisma.usePrisma().address.findFirst({
            where: {
               user_id: user_id
            }
         })
         const user = await this.prisma.usePrisma().user.findFirst({
            where: {
               id: user_id
            }
         })
         const newOrder = {
            order_code: generateOrderId(),
            order_total: order_total,
            order_date: today.toISOString(),
            user_id: user_id,
            street: shippingAddress.street,
            ward: shippingAddress.ward,
            province: shippingAddress.province,
            district: shippingAddress.district,
         }
         const { status, payment_status } = await this.stripe.createPaymentIntent(order_total, user.stripe_customer_id, card_id, shippingAddress, user, newOrder.order_code)
         const orderCreated = await this.prisma.usePrisma().order.create({
            data: {
               ...newOrder, payment_status: status.toUpperCase(), status: payment_status
            }
         })
         Promise.all(product.map(async item => {
            const newOrderDetail = {
               order_id: orderCreated.id,
               product_id: parseInt(item.id),
               quantity: parseInt(item.quantity),
               price: parseFloat(item.price)
            }
            return this.prisma.usePrisma().orderDetail.create({
               data: newOrderDetail
            })
         }))
         Promise.all(product.map(async (item) => {
            return await this.prisma.usePrisma().cart.findFirst({
               where: {
                  user_id: user_id,
                  product_id: parseInt(item.id)
               },
            })
         }))
         for (const item of product) {
            const cartItem = await this.prisma.usePrisma().cart.findFirst({
               where: {
                  user_id: user_id,
                  product_id: parseInt(item.id)
               },
            });
            if (cartItem) {
               await this.prisma.usePrisma().cart.delete({
                  where: { id: cartItem.id }
               });
            }
         }
         return HttpStatus.CREATED
      } catch (error) {
         return customResponse(null, Number(error.statusCode), error.raw.message)
      }
   }
}
