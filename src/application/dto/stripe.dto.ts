import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStripeCustomerDTO {
   readonly first_name: string;
   readonly last_name: string;
   readonly email: string;
}

export class CreateChargeDTO {
   @IsString()
   @IsNotEmpty()
   paymentMethodId: string;

   @IsNumber()
   amount: number;
}

