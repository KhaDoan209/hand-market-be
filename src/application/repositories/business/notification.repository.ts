import { CreateNotificationDTO } from "src/application/dto/notification.dto";

export interface NotificationRepository {
   createNewNotification(createNotificationDto: CreateNotificationDTO): Promise<any>;
   getListNotification(userId: number, pageNumber: number, pageSize: number): Promise<any>;
   setReadingStatus(userId: number, notiId: number): Promise<any>;
   deleteNotification(id: number): Promise<any>;
}