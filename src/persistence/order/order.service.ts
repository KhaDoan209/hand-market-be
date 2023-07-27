import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDTO } from 'src/application/dto/order.dto';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { OrderRepository } from 'src/application/repositories/business/order.repositiory';
import { generateOrderId } from 'src/shared/utils/custom-functions/custom-response';
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
@Injectable()
export class OrderService implements OrderRepository {
   constructor(private readonly prisma: PrismaService) {
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
         }
      })
      return getDataByPage(pageNumber, pageSize, totalRedcord, listOrder)
   }
   async createNewOrder(data: CreateOrderDTO): Promise<any> {
      try {
         const { order_total, discount_total, address_id, user_id, product } = data;
         const today = new Date();
         const newOrder = {
            order_code: generateOrderId(),
            order_total: order_total,
            discount_total: discount_total,
            order_date: today.toISOString(),
            status: OrderStatus.Pending,
            address_id: address_id,
            user_id: user_id
         }
         const orderCreated = await this.prisma.usePrisma().order.create({
            data: newOrder
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
         return HttpStatus.CREATED;
      } catch (error) {
         return HttpStatus.BAD_REQUEST
      }

   }
}
