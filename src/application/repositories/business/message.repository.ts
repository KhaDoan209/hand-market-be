import { CreateMessageDTO } from "src/application/dto/message.dto";

export interface MessageRepository {
   getListConversationByUser(userId: number, pageSize: number, pageNumber: number): Promise<any>
   getConversationDetail(conversationId: number): Promise<any>
   sendMessage(message: CreateMessageDTO): Promise<any>;
   getConversationMessage(conversationId: number, pageSize: number, pageNumber: number): Promise<any>;
   seenMessage(conversationId: number, userId: number): Promise<any>
   countUnseenMessage(userId: number): Promise<any>
}