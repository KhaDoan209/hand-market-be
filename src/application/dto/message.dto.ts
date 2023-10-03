import { IsString, IsNumber } from "class-validator";
export class CreateMessageDTO {
   sender_id: number;
   content: string;
   room_id: string;
   conversation_id: number;
}

export class CreateConversationDTO {
   sender_id: number;
   receiver_id: number;
   order_id: number;
}