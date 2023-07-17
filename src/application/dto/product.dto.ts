import { IsString, IsNumber, Max, Min, IsNotEmpty, IsDateString, MaxLength, IsEmpty } from "class-validator";

export class CreateProductDTO {
   @IsNotEmpty()
   @IsString()
   @MaxLength(100)
   name: string;

   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   price: number

   @IsString()
   description: string;

   @IsString()
   type: string

   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   quantity: number;

   @IsNotEmpty()
   @IsString()
   @MaxLength(100)
   brand: string;

   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   category_id: number;

   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   discount_id: number;

}

export class UpdateProductDTO {
   @IsString()
   @MaxLength(100)
   name: string;

   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   price: number

   @IsString()
   description: string;

   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   discount_id: number;

   @Min(0)
   @IsNotEmpty()
   @IsNumber()
   quantity: number;

}