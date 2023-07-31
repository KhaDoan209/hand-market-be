import { IsArray, IsNumber, IsString, } from "class-validator";
export class CreateOrderDTO {
   @IsNumber()
   user_id: number;
   @IsNumber()
   order_total: number;
   @IsArray()
   product: any[];
   @IsString()
   card_id: string
}