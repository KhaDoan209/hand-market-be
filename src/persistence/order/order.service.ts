import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDTO } from 'src/application/dto/order.dto';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { ShippingMethod } from 'src/domain/enums/shipping-method.enum';
import { OrderRepository } from 'src/application/repositories/business/order.repositiory';
import { customResponse, generateOrderId } from 'src/shared/utils/custom-functions/custom-response';
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
import { StripeService } from 'src/infrastructure/common/stripe/stripe.service';
import { MailerService } from '@nestjs-modules/mailer';
import { MapboxService } from 'src/infrastructure/common/map-box/mapbox.service';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDTO } from 'src/application/dto/notification.dto';
import { NotificationType } from 'src/domain/enums/notification.enum';
import { Order } from '@prisma/client';
import { Role } from 'src/domain/enums/roles.enum';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { EventGateway } from 'src/websocket/event.gateway';
import { SocketMessage } from 'src/domain/enums/socket-message.enum';
import { CreateConversationDTO, CreateMessageDTO } from 'src/application/dto/message.dto';
import { MessageService } from '../message/message.service';
@Injectable()
export class OrderService implements OrderRepository {
   constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService, private readonly mailService: MailerService,
      private readonly notiService: NotificationService,
      private readonly eventGateway: EventGateway,
      private readonly mapbox: MapboxService,
      private readonly messageService: MessageService) {
   }
   async getListOrder(orderStatus?: string, pageNumber?: number, pageSize?: number): Promise<any> {
      let orders: any
      const totalRecord = await this.prisma.usePrisma().order.count({
         where: {
            status: orderStatus ? orderStatus : {}
         }
      })
      if (pageNumber && pageSize) {
         orders = await this.prisma.usePrisma().order.findMany({
            where: {
               status: orderStatus ? orderStatus : {}
            }, include: {
               Order_user: true
            }, orderBy: {
               order_date: 'desc'
            }
         })
         console.log(orders);
         return getDataByPage(pageNumber, pageSize, totalRecord, orders)
      } else {
         orders = await this.prisma.usePrisma().order.findMany({
            where: {
               status: orderStatus ? orderStatus : {}
            }, include: {
               Order_user: true
            }
         })
         return getDataByPage(undefined, undefined, totalRecord, orders)
      }
   }

   async getListOrderByUserForAdmin(userId: number, orderStatus?: string): Promise<any> {
      const result = await this.prisma.usePrisma().order.findMany({
         where: {
            user_id: userId,
            status: orderStatus ? orderStatus : {}
         }
      })
      return result
   }

   async getListOrderByUser(userId: number, pageNumber: number = 1, pageSize: number = 8,): Promise<any> {
      const totalRecord = Math.ceil(await this.prisma.usePrisma().order.count({
         where: {
            user_id: userId
         }
      }))
      const listOrder = await this.prisma.usePrisma().order.findMany({
         where: {
            user_id: Number(userId)
         }, include: {
            Order_user: true
         }, orderBy: {
            order_date: 'desc'
         }
      })
      return getDataByPage(pageNumber, pageSize, totalRecord, listOrder)
   }

   async getListOrderByShipper(shipperId: number, pageNumber: number = 1, pageSize: number = 8,): Promise<any> {
      const totalRecord = Math.ceil(await this.prisma.usePrisma().order.count({
         where: {
            shipper_id: shipperId
         }
      }))
      const listOrder = await this.prisma.usePrisma().order.findMany({
         where: {
            shipper_id: shipperId
         }, include: {
            Order_user: true
         }, orderBy: {
            order_date: 'desc'
         }
      })
      return getDataByPage(pageNumber, pageSize, totalRecord, listOrder)
   }

   async getListPendingDeliveryOrder() {
      const listPendingOrder = await this.prisma.usePrisma().order.findMany({
         where: {
            shipper_id: null,
            status: OrderStatus.Freepick
         },
         orderBy: {
            order_date: 'desc'
         },
         include: {
            Order_user: true
         }
      })
      return listPendingOrder
   }

   async getOrderDetail(orderId: number): Promise<any> {
      const order = await this.prisma.usePrisma().order.findFirst({
         where: {
            id: orderId,
         }, include: {
            Order_user: true,
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
            Order_user: true
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
            Order_user: {
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
         const coordinates = await this.mapbox.getCoordinates(`${shippingAddress.street + ', ' + shippingAddress.ward + ', ' + shippingAddress.province}`)
         const orderCreated = await this.prisma.usePrisma().order.create({
            data: {
               ...newOrder, payment_status: payment_status, status: status, long: coordinates.longitude, lat: coordinates.latitude
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
            const productToIncreasePurchase = await this.prisma.usePrisma().product.findFirst({
               where: {
                  id: item.id
               }
            })
            await this.prisma.usePrisma().product.update({
               where: {
                  id: productToIncreasePurchase.id
               }, data: {
                  purchase: productToIncreasePurchase.purchase + 1
               }
            })
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
            const roomSockets = this.eventGateway.server.sockets.adapter.rooms.get(Role.Shipper);
            if (roomSockets) {
               const socketIds = Array.from(roomSockets);
               for (const id of socketIds) {
                  let pickedUpOrder = await this.prisma.usePrisma().order.findFirst({
                     where: {
                        id: orderCreated.id,
                        status: OrderStatus.Confirmed
                     },
                     include: {
                        Order_user: true
                     }
                  })
                  this.eventGateway.server.to(id).emit(SocketMessage.NewOrder, pickedUpOrder);
                  await new Promise((resolve) => setTimeout(resolve, 6000));
               }
            }
         }
         await userNotificationPromise;
         setTimeout(async () => {
            await notifyShippers();
            let pickedUpOrder = await this.prisma.usePrisma().order.findFirst({
               where: {
                  id: orderCreated.id,
               },
            })
            if (pickedUpOrder.status === OrderStatus.Confirmed) {
               await this.prisma.usePrisma().order.update({
                  where: {
                     id: pickedUpOrder.id,
                  }, data: {
                     status: OrderStatus.Freepick
                  }
               })
               return this.eventGateway.server.to(Role.Shipper).emit(SocketMessage.NewFreepick);
            }
         }, 1000);
         return HttpStatus.CREATED;
      } catch (error) {
         return customResponse(null, Number(error.statusCode), error.raw.message)
      }
   }

   async takeAnOrder(shipperId: number, orderId: number): Promise<any> {
      try {
         const today = new Date();
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
               const newConversation: CreateConversationDTO = {
                  sender_id: receivedOrder.user_id,
                  receiver_id: receivedOrder.shipper_id,
                  order_id: receivedOrder.id,

               }
               const createdConversation = await this.prisma.usePrisma().conversation.create({
                  data: {
                     ...newConversation, created_at: today.toISOString(), lastest_message: today.toISOString()
                  }
               })
               const newMessage: CreateMessageDTO = {
                  conversation_id: createdConversation.id,
                  content: "Tin nhắn tự động: Xin chào! Đơn hàng của bạn đã được chúng tôi xác nhận và đang tìm shipper phù hợp. Chúng tôi sẽ đảm bảo rằng đơn hàng sẽ được vận chuyển an toàn và đúng hẹn. Nếu bạn có bất kỳ câu hỏi hoặc cần thêm thông tin, hãy liên hệ với chúng tôi qua số điện thoại: 0907874726. Chúc bạn một ngày tốt lành!",
                  room_id: receivedOrder.room_id,
                  sender_id: receivedOrder.shipper_id,
               }
               await this.prisma.usePrisma().message.create({
                  data: {
                     ...newMessage, created_at: today.toISOString(),
                     seen: false, receiver_id: receivedOrder.user_id
                  }
               })
               await this.prisma.usePrisma().conversation.update({
                  where: {
                     id: createdConversation.id,
                  },
                  data: {
                     lastest_message: today.toISOString(),
                     latest_text: newMessage.content
                  }
               })
               await this.notiService.createNewNotification(newNotification)
               this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.NewConversation, createdConversation)
               this.eventGateway.server.to(userSocketId).emit(SocketMessage.NewConversation, createdConversation)
               this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.NewMessage, createdConversation)
               this.eventGateway.server.to(userSocketId).emit(SocketMessage.NewMessage, createdConversation)
               this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateFreepick)
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
      const today = new Date()
      const order = await this.prisma.usePrisma().order.findFirst({
         where: {
            id: orderId
         }
      })
      const conversation = await this.prisma.usePrisma().conversation.findFirst({
         where: {
            order_id: order.id
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
         await this.prisma.usePrisma().order.update({
            where: {
               id: order.id
            },
            data: {
               actual_delivery_date: today.toISOString()
            }
         })
         let newNotification: CreateNotificationDTO = {
            order_id: orderId,
            link: orderId.toString(),
            type: NotificationType.ORDER_DELIVERED,
            product_id: null,
            user_id: null
         }
         let message: CreateMessageDTO = {
            sender_id: order.shipper_id,
            content: "Đơn hàng của bạn đã được giao đến, shipper sẽ rời khỏi cuộc trò chuyện. Nếu có thắc mắc, vui lòng liên hệ số điện thoại 0907874726, hoặc địa chỉ email handmarket@gmail.com",
            room_id: order.room_id,
            conversation_id: conversation.id
         }
         await this.messageService.sendMessage(message)
         await this.notiService.createNewNotification(newNotification)
         this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateOrderInProgress)
         this.eventGateway.server.to(shipperSocketId).emit(SocketMessage.UpdateWaitingDone)
         await this.eventGateway.joinRoom(order.shipper_id, Role.Shipper)
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
         this.eventGateway.server.to(userSocketId).emit(SocketMessage.OrderStatusUpdate)
         return this.eventGateway.leaveRoom(order.user_id, order.room_id)
      }
   }

   async cancelAnOrder(orderId: number, cancel_reason: string): Promise<any> {
      const order = await this.prisma.usePrisma().order.findFirst({
         where: {
            id: orderId
         }
      })
      const conversation = await this.prisma.usePrisma().conversation.findFirst({
         where: {
            order_id: order.id
         }
      })
      const message: CreateMessageDTO = {
         sender_id: order.shipper_id,
         content: `Đơn hàng của bạn đã bị hủy với lý do: ${cancel_reason}. Nếu có thắc mắc, vui lòng liên hệ số điện thoại 0907874726, hoặc địa chỉ email handmarket@gmail.com`,
         room_id: order.room_id,
         conversation_id: conversation.id
      }

      await this.prisma.usePrisma().order.update({
         where: {
            id: orderId,
         },
         data: {
            status: OrderStatus.Canceled,
            cancel_reason: cancel_reason
         }
      })
      const newNotification: CreateNotificationDTO = {
         user_id: null,
         order_id: order.id,
         type: NotificationType.ORDER_CANCELLED,
         product_id: null,
         link: order.id.toString(),
      }
      await this.notiService.createNewNotification(newNotification)
      await this.messageService.sendMessage(message)
      const shipperSocket = this.eventGateway.getSocketIdByUserId(order.shipper_id.toString())
      this.eventGateway.joinRoom(order.shipper_id, Role.Shipper)
      this.eventGateway.server.to(shipperSocket).emit(SocketMessage.UpdateOrderInProgress)
   }

}
