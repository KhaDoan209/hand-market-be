import { Injectable, Inject } from '@nestjs/common';
import { CreateNotificationDTO } from '../../application/dto/notification.dto';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { NotificationRepository } from 'src/application/repositories/business/notification.repository';
import { NotificationType, NotificationContent } from 'src/domain/enums/notification.enum';
import { EventGateway } from '../../websocket/event.gateway';
import { Role } from 'src/domain/enums/roles.enum';
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
@Injectable()
export class NotificationService implements NotificationRepository {
  constructor(private readonly prisma: PrismaService,
    @Inject(EventGateway) private eventGateway: EventGateway) {
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
        this.eventGateway.server.to(Role.User).emit("new_notification");
        break;

      case NotificationType.ORDER_PLACED:
        const order = await this.prisma.usePrisma().order.findFirst({
          where: {
            id: order_id
          }
        })
        await this.prisma.usePrisma().notification.create({
          data: {
            ...newNotification,
            is_read: false,
            created_at: today.toISOString(),
            content: order.order_code + " - " + NotificationContent.ORDER_PLACED,
            noti_type: type,
            receiver_id: order.user_id
          }
        })
        const socket_id = this.eventGateway.getSocketIdByUserId(order.user_id.toString())
        if (socket_id) {
          return this.eventGateway.server.to(socket_id).emit("new_notification")
        }

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
      return this.eventGateway.server.to(socket_id).emit("read_noti")
    }
    return null
  }

  deleteNotification(id: number): Promise<any> {
    return
  }
}
