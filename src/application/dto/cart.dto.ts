import { IsNumber, IsNotEmpty, Min } from "class-validator";
export class CreateCartDTO {
   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   product_id: number;

   @Min(0)
   @IsNumber()
   @IsNotEmpty()
   user_id: number;

}

export class UpdateCartDTO {
}