import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { MessageService } from '../persistence/message/message.service';
import { CreateMessageDTO } from 'src/application/dto/message.dto';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { query } from 'express';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Get('/get-list-conversation/:id')
  async getListConversationByUser(@Param('id') userId: number, @Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.messageService.getListConversationByUser(+userId, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list conversation successfully")
  }

  @Get('/get-conversation-detail/:id')
  async getConversationDetail(@Param('id') conversationId: number) {
    const data = await this.messageService.getConversationDetail(+conversationId)
    return customResponse(data, HttpStatus.OK, "Get conversation detail sucessfully")
  }

  @Get('/get-conversation-message/:conversation_id')
  async getConverSationMessage(@Param('conversation_id') conversationId: number, @Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.messageService.getConversationMessage(+conversationId, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list conversation successfully")
  }

  @Get('/count-unseen-message/:user_id')
  async countUnseenMessage(@Param('user_id') userId: number) {
    const data = await this.messageService.countUnseenMessage(+userId)
    return customResponse(data, HttpStatus.OK, "Get list unseen message sucessfully")
  }

  @Post('/send-message')
  async sendMessage(@Body() body: CreateMessageDTO) {
    await this.messageService.sendMessage(body)
    return customResponse(null, HttpStatus.CREATED, 'Send message successfully')
  }

  @Post('/seen-message')
  async seenMessage(@Query() query: any) {
    const { userId, conversationId } = query
    await this.messageService.seenMessage(+conversationId, +userId)
    return customResponse(null, HttpStatus.CREATED, 'Seen message successfully')
  }

}
