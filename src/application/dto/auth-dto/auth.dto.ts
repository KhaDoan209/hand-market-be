import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginDTO {
   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly email: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly password: string;
}

export class AuthRegisterDTO {
   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly first_name: string;
   
   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly last_name: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly email: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly password: string
}