import { IsNotEmpty, IsString, MinLength } from 'class-validator';
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
   @MinLength(1)
   @ApiProperty()
   readonly password: string
}

export class FacebookLoginDTO {
   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly app_id: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly email: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly first_name: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly avatar: string;
}

export class GoogleLoginDTO {
   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly app_id: string;

   @IsNotEmpty()
   @IsString()
   @ApiProperty()
   readonly email: string;

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
   readonly avatar: string;
}