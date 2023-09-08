import { Injectable } from '@nestjs/common';
import { CreateMessageDTO } from 'src/application/dto/message.dto';
import { MessageRepository } from 'src/application/repositories/business/message.repository';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { EventGateway } from 'src/websocket/event.gateway';
import { SocketMessage } from 'src/domain/enums/socket-message.enum';
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
import { Socket } from 'socket.io';
@Injectable()
export class MessageService implements MessageRepository {
  constructor(private readonly prisma: PrismaService, private readonly eventGateway: EventGateway) {
  }
  async getListConversationByUser(userId: number, pageNumber?: number, pageSize?: number): Promise<any> {
    const totalRecord = await this.prisma.usePrisma().conversation.count({
      where: {
        sender_id: userId
      },
    })
    const list_conversation = await this.prisma.usePrisma().conversation.findMany({
      where: {
        OR: [
          {
            sender_id: userId
          },
          {
            receiver_id: userId
          }
        ]
      },
      include: {
        Order: true,
        Conversation_receiver: true,
        Conversation_sender: true
      }, orderBy: {
        lastest_message: 'desc'
      }
    });
    if (pageNumber && pageSize) {
      return getDataByPage(pageNumber, pageSize, totalRecord, list_conversation)
    } else {
      return getDataByPage(undefined, undefined, totalRecord, list_conversation)
    }
  }

  async getConversationDetail(conversationId: number): Promise<any> {
    return await this.prisma.usePrisma().conversation.findFirst({
      where: {
        id: conversationId
      },
      include: {
        Order: true,
        Conversation_receiver: {
          select: {
            last_name: true,
            first_name: true,
            avatar: true,
            email: true,
            phone: true,
          }
        },
        Conversation_sender: {
          select: {
            last_name: true,
            first_name: true,
            avatar: true,
            email: true,
            phone: true,
          }
        },
      }
    })
  }

  async getConversationMessage(conversationId: number, pageNumber?: number, pageSize?: number): Promise<any> {
    let result: any;
    const totalRecord = await this.prisma.usePrisma().message.count({
      where: {
        conversation_id: conversationId
      },
      orderBy: {
        created_at: "asc"
      }
    })
    result = await this.prisma.usePrisma().message.findMany({
      where: {
        conversation_id: conversationId
      },
      include: {
        Message_sender: {
          select: {
            last_name: true,
            first_name: true,
            avatar: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    })
    if (pageNumber && pageSize) {
      return getDataByPage(pageNumber, pageSize, totalRecord, result)
    } else {
      return getDataByPage(undefined, undefined, totalRecord, result)
    }
  }

  async countUnseenMessage(userId: number): Promise<any> {
    const result = await this.prisma.usePrisma().message.findMany({
      where: {
        receiver_id: userId,
        seen: false
      }
    })
    return result
  }

  async sendMessage(message: CreateMessageDTO): Promise<any> {
    const today = new Date()
    let newMessage: any;
    const { room_id, conversation_id, content, sender_id } = message
    const conversation = await this.prisma.usePrisma().conversation.findFirst({
      where: {
        id: conversation_id
      }
    })
    if (sender_id === conversation.sender_id) {
      newMessage = await this.prisma.usePrisma().message.create({
        data: { ...message, created_at: today.toISOString(), seen: false, receiver_id: conversation.receiver_id }
      })
    } else {
      newMessage = await this.prisma.usePrisma().message.create({
        data: { ...message, created_at: today.toISOString(), seen: false, receiver_id: conversation.sender_id }
      })
    }
    const unseenMessage = await this.prisma.usePrisma().message.count({
      where: {
        conversation_id: conversation_id,
        seen: false,
        sender_id: sender_id
      }
    })
    await this.prisma.usePrisma().conversation.update({
      where: {
        id: conversation_id,
      },
      data: {
        lastest_message: today.toISOString(),
        latest_text: content,
      }
    })
    if (sender_id === conversation.sender_id) {
      await this.prisma.usePrisma().conversation.update({
        where: {
          id: conversation_id
        }, data: {
          receiver_unseen: unseenMessage
        }
      })
    } else {
      await this.prisma.usePrisma().conversation.update({
        where: {
          id: conversation_id
        }, data: {
          sender_unseen: unseenMessage
        }
      })
    }
    const messageToResponse = await this.prisma.usePrisma().message.findFirst({
      where: {
        id: newMessage.id
      }, include: {
        Message_sender: {
          select: {
            last_name: true,
            first_name: true,
            avatar: true,
            email: true,
            phone: true,
          }
        }
      }
    })
    return this.eventGateway.server.to(room_id).emit(SocketMessage.NewMessage, messageToResponse)
  }

  async seenMessage(conversationId: number, userId: number): Promise<any> {
    await this.prisma.usePrisma().message.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: {
          not: userId,
        },
        seen: false
      },
      data: {
        seen: true
      }
    })
    const conversation = await this.prisma.usePrisma().conversation.findFirst({
      where: {
        id: conversationId
      }
    })
    if (conversation.sender_id === userId) {
      await this.prisma.usePrisma().conversation.update({
        where: {
          id: conversationId
        }, data: {
          sender_unseen: 0
        }
      })
    } else {
      await this.prisma.usePrisma().conversation.update({
        where: {
          id: conversationId
        }, data: {
          receiver_unseen: 0
        }
      })
    }
    const senderSocketId = this.eventGateway.getSocketIdByUserId(conversation.sender_id.toString())
    return this.eventGateway.server.to(senderSocketId).emit(SocketMessage.SeenMessage)
  }
}
