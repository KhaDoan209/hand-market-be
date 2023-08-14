import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDTO } from 'src/application/dto/order.dto';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { ShippingMethod } from 'src/domain/enums/shipping-method.enum';
import { OrderRepository } from 'src/application/repositories/business/order.repositiory';
import { customResponse, generateOrderId } from 'src/shared/utils/custom-functions/custom-response';
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
import { StripeService } from 'src/infrastructure/common/stripe/stripe.service';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDTO } from 'src/application/dto/notification.dto';
import { NotificationType } from 'src/domain/enums/notification.enum';
import { Order } from '@prisma/client';
import { Role } from 'src/domain/enums/roles.enum';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { EventGateway } from 'src/websocket/event.gateway';
import { SocketMessage } from 'src/domain/enums/socket-message.enum';
@Injectable()
export class OrderService implements OrderRepository {
   constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService, private readonly mailService: MailerService,
      private readonly notiService: NotificationService,
      private readonly eventGateway: EventGateway) {
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
   async getListPendingDeliveryOrder() {
      const listPendingOrder = await this.prisma.usePrisma().order.findMany({
         where: {
            shipper_id: null,
            status: OrderStatus.Confirmed
         },
         orderBy: {
            order_date: 'desc'
         },
         include: {
            User: true
         }
      })
      return listPendingOrder
   }

   async getOrderDetail(orderId: number): Promise<any> {
      const order = await this.prisma.usePrisma().order.findFirst({
         where: {
            id: orderId,
         }, include: {
            OrderDetail: {
               include: {
                  Product: true,
               }
            }
         }
      });
      let shipper = null;
      if (order.shipper_id !== null) {
         shipper = await this.prisma.usePrisma().user.findFirst({
            where: {
               id: order.shipper_id,
            },
         });
      }
      const data = {
         order,
         shipper,
      };
      return data;
   }

   async getListDoneOrder(shipperId: number) {
      const listOrderDone = await this.prisma.usePrisma().order.findMany({
         where: {
            shipper_id: shipperId,
            status: OrderStatus.Done
         }
      })
      return listOrderDone
   }

   async getListWaitingDoneOrder(shipperId: number): Promise<any> {
      return await this.prisma.usePrisma().order.findMany({
         where: {
            shipper_id: shipperId,
            status: OrderStatus.Delivered
         },
         orderBy: {
            order_date: 'desc'
         },
         include: {
            User: true
         }
      })
   }

   async getOrderInProgress(shipperId: number) {
      return await this.prisma.usePrisma().order.findFirst({
         where: {
            shipper_id: shipperId,
            OR: [
               {
                  status: OrderStatus.OutOfDelivery
               },
               {
                  status: OrderStatus.BeingShipped
               }
            ]
         }, include: {
            User: {
               select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  avatar: true,
                  phone: true,
               }
            },
            OrderDetail: {
               include: {
                  Product: true
               }
            }
         }
      })
   }

   async createNewOrder(data: CreateOrderDTO): Promise<any> {
      try {
         const { order_total, user_id, product, card_id, shipping_method } = data;
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
         let expected_delivery_date = new Date(today);
         if (shipping_method === ShippingMethod.Standard) {
            expected_delivery_date.setDate(today.getDate() + 5)
         } else if (shipping_method === ShippingMethod.Fast) {
            expected_delivery_date.setDate(today.getDate() + 3)
         } else {
            expected_delivery_date = today
         }
         const newOrder = {
            order_code: generateOrderId(),
            order_total: order_total,
            order_date: today.toISOString(),
            user_id: user_id,
            street: shippingAddress.street,
            ward: shippingAddress.ward,
            province: shippingAddress.province,
            district: shippingAddress.district,
            expected_delivery_date,
         }
         const { status, payment_status } = await this.stripe.createPaymentIntent(order_total, user.stripe_customer_id, card_id, shippingAddress, user, newOrder.order_code)
         const orderCreated = await this.prisma.usePrisma().order.create({
            data: {
               ...newOrder, payment_status: payment_status, status: status
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
         let newNotification: CreateNotificationDTO = {
            user_id: null,
            order_id: orderCreated.id,
            type: NotificationType.ORDER_PLACED,
            product_id: null,
            link: orderCreated.id.toString()
         }
         const userNotificationPromise = this.notiService.createNewNotification(newNotification);
         const notifyShippers = async () => {
            const pickedUpOrder = await this.prisma.usePrisma().order.findFirst({
               where: {
                  id: orderCreated.id
               },
               include: {
                  User: true,
               }
            })
            const roomSockets = this.eventGateway.server.sockets.adapter.rooms.get(Role.Shipper);
            if (roomSockets) {
               const socketIds = Array.from(roomSockets);
               for (const id of socketIds) {
                  this.eventGateway.server.to(id).emit(SocketMessage.NewOrder, pickedUpOrder)
                  await new Promise((resolve) => setTimeout(resolve, 6000));
               }
            }
         };
         await userNotificationPromise;
         setTimeout(() => {
            notifyShippers();
         }, 1000);
         return HttpStatus.CREATED;
      } catch (error) {
         return customResponse(null, Number(error.statusCode), error.raw.message)
      }
   }

   async takeAnOrder(shipperId: number, orderId: number): Promise<any> {
      try {
         const checkShipper = await this.prisma.usePrisma().order.findMany({
            where: {
               shipper_id: Number(shipperId),
               OR: [
                  {
                     status: OrderStatus.OutOfDelivery
                  },
                  {
                     status: OrderStatus.BeingShipped
                  }
               ]
            }
         })
         if (checkShipper.length > 0) {
            return HttpStatus.CONFLICT
         } else {
            const order: Order = await this.prisma.usePrisma().order.findFirst({
               where: {
                  id: orderId
               }
            })
            if (order.shipper_id === null) {
               const receivedOrder = await this.prisma.usePrisma().order.update({
                  where: {
                     id: orderId
                  },
                  data: {
                     shipper_id: shipperId,
                     status: OrderStatus.OutOfDelivery,
                     room_id: order.order_code
                  }
               })
               await this.eventGateway.leaveRoom(shipperId, Role.Shipper)
               await this.eventGateway.joinRoom(shipperId, receivedOrder.room_id)
               await this.eventGateway.joinRoom(receivedOrder.user_id, receivedOrder.room_id)
               const shipperSocketId = this.eventGateway.getSocketIdByUserId(shipperId.toString())
               const userSocketId = this.eventGateway.getSocketIdByUserId(receivedOrder.user_id.toString())
               const newNotification: CreateNotificationDTO = {
                  user_id: null,
                  order_id: receivedOrder.id,
                  type: NotificationType.SHIPMENT_OUT_FOR_DELIVERY,
                  product_id: null,
                  link: receivedOrder.id.toString(),
               }
               await this.notiService.createNewNotification(newNotification)
               this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateOrderInProgress)
               this.eventGateway.server.to(userSocketId).emit(SocketMessage.OrderStatusUpdate)
               this.eventGateway.server.to(Role.Shipper).emit(SocketMessage.UpdateFreepick)
               return HttpStatus.OK
            }
            else {
               return HttpStatus.NO_CONTENT
            }
         }
      } catch (error) {
         console.log(error);
      }
   }

   async changeOrderStatus(orderId: number, status: string): Promise<any> {
      const order = await this.prisma.usePrisma().order.findFirst({
         where: {
            id: orderId
         }
      })
      await this.prisma.usePrisma().order.update({
         where: {
            id: orderId,
         },
         data: {
            status: status
         }
      })
      let shipperSocketId = this.eventGateway.getSocketIdByUserId(order.shipper_id.toString())
      let userSocketId = this.eventGateway.getSocketIdByUserId(order.user_id.toString())
      if (status === OrderStatus.BeingShipped) {
         let newNotification: CreateNotificationDTO = {
            order_id: orderId,
            link: orderId.toString(),
            type: NotificationType.ORDER_RECEIVED,
            product_id: null,
            user_id: null
         }
         await this.notiService.createNewNotification(newNotification)
         this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateOrderInProgress)
         return this.eventGateway.server.to(userSocketId).emit(SocketMessage.OrderStatusUpdate)
      }
      else if (status === OrderStatus.Delivered) {
         let newNotification: CreateNotificationDTO = {
            order_id: orderId,
            link: orderId.toString(),
            type: NotificationType.ORDER_DELIVERED,
            product_id: null,
            user_id: null
         }
         await this.notiService.createNewNotification(newNotification)
         this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateOrderInProgress)
         this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateWaitingDone)
         return this.eventGateway.server.to(userSocketId).emit(SocketMessage.OrderStatusUpdate)
      }
      else if (status === OrderStatus.Done) {
         let newNotification: CreateNotificationDTO = {
            order_id: orderId,
            link: orderId.toString(),
            type: NotificationType.ORDER_DONE,
            product_id: null,
            user_id: null
         }
         await this.notiService.createNewNotification(newNotification)
         this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateWaitingDone)
         this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.NewNotification)
         return this.eventGateway.server.to(userSocketId).emit(SocketMessage.OrderStatusUpdate)
      }
   }

   async devSendOrder() {
      const order = {
         id: 77,
         order_date: "2023-08-13T12:25:41.000Z",
         status: "Confirmed",
         payment_status: "succeeded",
         order_total: "30757",
         credit_id: null,
         user_id: 13,
         order_code: "HM540538",
         street: "26/4 Hoàng Sĩ Khải",
         ward: "An Hải Bắc",
         province: "Đà Nẵng",
         district: "Sơn Trà",
         expected_delivery_date: "2023-08-18T12:25:40.533Z",
         actual_delivery_date: null,
         room_id: null,
         shipper_id: null,
         User: {
            id: 13,
            first_name: "Nam",
            last_name: "Nguyen",
            email: "nam@gmail.com",
            password: "$2b$10$nkBYo3.i9zneI3d1QcJh9ukcX3Vt3Y67wWzevYki5cd3Ow8C8J/6a",
            role: "User",
            is_locked: false,
            is_banned: false,
            refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxMywiZW1haWwiOiJuYW1AZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmIkMTAkbmtCWW8zLmk5em5lSTNkMVFjSmg5dWtjWDNWdDNZNjd3V3pldllraTVjZDNPdzhDOEovNmEifSwiaWF0IjoxNjkxODA4Mzk3LCJleHAiOjE2OTQ0MDAzOTd9.qI4eiV0KLQw5tFUG_qWgF7EJgtGiHbXofOw_uWfEMns",
            avatar: "http://res.cloudinary.com/dudhcr2rt/image/upload/v1691397958/hand-market/kb6igi0ndporbzfw89f8.jpg",
            is_deleted: false,
            phone: "0907874726",
            stripe_customer_id: "cus_ONGFCBHtdCx7iW",
            socket_id: "iPw10_4MuCPl0u3sAAAJ"
         }
      }
      const roomSockets = this.eventGateway.server.sockets.adapter.rooms.get(Role.Shipper);
      if (roomSockets) {
         const socketIds = Array.from(roomSockets);
         for (const id of socketIds) {
            this.eventGateway.server.to(id).emit(SocketMessage.NewOrder, order)
            await new Promise((resolve) => setTimeout(resolve, 6000));
         }
      }
      return roomSockets
   }
}
