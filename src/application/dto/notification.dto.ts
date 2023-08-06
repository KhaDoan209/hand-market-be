import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateNotificationDTO {
   @IsOptional()
   user_id: number;

   @IsOptional()
   order_id: number;

   @IsOptional()
   product_id: number;

   @IsOptional()
   link: string;

   @IsString()
   type: string;
}
