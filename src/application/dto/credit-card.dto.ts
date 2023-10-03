import { IsString } from "class-validator";
export class CreateCreditCardDTO {
   @IsString()
   card_token: string;

   @IsString()
   customer_stripe_id: string;
}