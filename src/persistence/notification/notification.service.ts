import { Injectable, Inject } from '@nestjs/common';
import { CreateNotificationDTO } from '../../application/dto/notification.dto';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { NotificationRepository } from 'src/application/repositories/business/notification.repository';
import { NotificationType, NotificationContent } from 'src/domain/enums/notification.enum';
import { EventGateway } from '../../websocket/event.gateway';
import { Role } from 'src/domain/enums/roles.enum';
import { SocketMessage } from 'src/domain/enums/socket-message.enum';
@Injectable()
export class NotificationService implements NotificationRepository {
  constructor(private readonly prisma: PrismaService,
    private readonly eventGateway: EventGateway) {
  }
  async getListNotification(userId: number): Promise<any> {
    const listNotification = await this.prisma.usePrisma().notification.findMany({
      where: {
        receiver_id: userId
      }, orderBy: {
        created_at: 'desc'
      }, include: {
        Product: true,
        Order: true,
        User: true,
      }
    })
    return listNotification
  }

  async createNewNotification(createNotificationDto: CreateNotificationDTO): Promise<any> {
    const today = new Date();
    const { type, link, order_id, product_id, user_id } = createNotificationDto
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        role: Role.User
      }
    })
    const listShipper = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        },
        role: Role.Shipper
      }
    })
    const newNotification = {
      user_id,
      order_id,
      product_id,
      link
    }
    switch (type) {
      case NotificationType.NEW_PRODUCT_AVAILABLE:
        for (const item of listUser) {
          try {
            await this.prisma.usePrisma().notification.create({
              data: {
                ...newNotification,
                is_read: false,
                created_at: today.toISOString(),
                content: NotificationContent.NEW_PRODUCT_AVAILABLE,
                noti_type: type,
                receiver_id: item.id
              }
            });
          } catch (error) {
            console.log(error);
          }
        }
        this.eventGateway.server.to(Role.User).emit(SocketMessage.NewNotification);
        break;
      case NotificationType.ORDER_PLACED:
        const placedOrder = await this.prisma.usePrisma().order.findFirst({
          where: {
            id: order_id
          }
        })
        await this.prisma.usePrisma().notification.create({
          data: {
            ...newNotification,
            is_read: false,
            created_at: today.toISOString(),
            content: placedOrder.order_code + " - " + NotificationContent.ORDER_PLACED,
            noti_type: type,
            receiver_id: placedOrder.user_id
          }
        })
        const socketIdPlacedOrder = this.eventGateway.getSocketIdByUserId(placedOrder.user_id.toString())
        if (socketIdPlacedOrder) {
          this.eventGateway.server.to(socketIdPlacedOrder).emit(SocketMessage.NewNotification)
        }
        this.eventGateway.server.to(Role.Shipper).emit(SocketMessage.NewFreepick);
        break;
      case NotificationType.SHIPMENT_OUT_FOR_DELIVERY:
        const orderToShip = await this.prisma.usePrisma().order.findFirst({
          where: {
            id: order_id
          }
        })
        await this.prisma.usePrisma().notification.create({
          data: {
            ...newNotification,
            is_read: false,
            created_at: today.toISOString(),
            content: orderToShip.order_code + " - " + NotificationContent.SHIPMENT_OUT_FOR_DELIVERY,
            noti_type: type,
            receiver_id: orderToShip.user_id,
          }
        })
        const socketIdDeliveryOrder = this.eventGateway.getSocketIdByUserId(orderToShip.user_id.toString())
        if (socketIdDeliveryOrder) {
          this.eventGateway.server.to(socketIdDeliveryOrder).emit(SocketMessage.NewNotification)
        }
        break;
      case NotificationType.ORDER_RECEIVED:
        const orderReceived = await this.prisma.usePrisma().order.findFirst({
          where: {
            id: order_id
          }
        })
        await this.prisma.usePrisma().notification.create({
          data: {
            ...newNotification,
            is_read: false,
            created_at: today.toISOString(),
            content: orderReceived.order_code + " - " + NotificationContent.ORDER_RECEIVED,
            noti_type: type,
            receiver_id: orderReceived.user_id,
          }
        })
        const socketIdReceivedOrder = this.eventGateway.getSocketIdByUserId(orderReceived.user_id.toString())
        if (socketIdReceivedOrder) {
          this.eventGateway.server.to(socketIdReceivedOrder).emit(SocketMessage.NewNotification)
        }
        break;
      case NotificationType.ORDER_DELIVERED:
        const orderDelivered = await this.prisma.usePrisma().order.findFirst({
          where: {
            id: order_id
          }
        })
        await this.prisma.usePrisma().notification.create({
          data: {
            ...newNotification,
            is_read: false,
            created_at: today.toISOString(),
            content: orderDelivered.order_code + " - " + NotificationContent.ORDER_DELIVERED,
            noti_type: type,
            receiver_id: orderDelivered.user_id,
          }
        })
        const socketIdOrderDelivered = this.eventGateway.getSocketIdByUserId(orderDelivered.user_id.toString())
        if (socketIdOrderDelivered) {
          this.eventGateway.server.to(socketIdOrderDelivered).emit(SocketMessage.NewNotification)
        }
        break;
      case NotificationType.ORDER_DONE:
        const orderDone = await this.prisma.usePrisma().order.findFirst({
          where: {
            id: order_id
          }
        })
        await this.prisma.usePrisma().notification.create({
          data: {
            ...newNotification,
            is_read: false,
            created_at: today.toISOString(),
            content: orderDone.order_code + " - " + NotificationContent.ORDER_DONE,
            noti_type: type,
            receiver_id: orderDone.shipper_id,
          }
        })
        const socketIdOrderDone = this.eventGateway.getSocketIdByUserId(orderDone.shipper_id.toString())
        if (socketIdOrderDone) {
          this.eventGateway.server.to(socketIdOrderDone).emit(SocketMessage.NewNotification)
        }
        break;
      default:
        break;
    }
    return
  }

  async setReadingStatus(userId: number, notiId: number): Promise<any> {
    const socket_id = this.eventGateway.getSocketIdByUserId(userId.toString())
    await this.prisma.usePrisma().notification.update({
      where: {
        id: notiId
      },
      data: {
        is_read: true,
      }
    })
    if (socket_id) {
      return this.eventGateway.server.to(socket_id).emit(SocketMessage.ReadNoti)
    }
    return null
  }

  deleteNotification(id: number): Promise<any> {
    return
  }
}
