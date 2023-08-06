import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { NotificationService } from '../persistence/notification/notification.service';
import { CreateNotificationDTO } from '../application/dto/notification.dto';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get('get-list-notification/:id')
  async getListNotification(@Param('id') userId: number, @Query() query: any) {
    const { pageNumber, pageSize } = query
    const result = await this.notificationService.getListNotification(+userId)
    return customResponse(result, HttpStatus.OK, "Get list notfication successfully")
  }

  @Post('create-new-notification')
  async createNewNotification(@Body() createNotificationDto: CreateNotificationDTO) {
    return this.notificationService.createNewNotification(createNotificationDto);
  }

  @Post('set-reading-status/:userId/:notiId')
  async setReadingStatus(@Param('notiId') notiId: number, @Param('userId') userId: number) {
    return this.notificationService.setReadingStatus(+userId, +notiId)
  }
}
