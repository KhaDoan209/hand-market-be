import { IsArray, IsNumber, IsString, } from "class-validator";
export class CreateOrderDTO {
   @IsNumber()
   address_id: number;
   @IsNumber()
   user_id: number;
   @IsNumber()
   order_total: number;
   @IsNumber()
   discount_total: number;
   @IsArray()
   product: any[];
}