import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDTO {
   @IsString()
   @MaxLength(50)
   readonly first_name: string;

   @MaxLength(50)
   @IsString()
   readonly last_name: string;

   @IsBoolean()
   readonly is_locked: boolean;

   @IsString()
   @MaxLength(15)
   readonly phone: string;
}

export class ChangeUserPasswordDTO {
   @IsString()
   @MinLength(1)
   readonly password: string
}

export class UpdateUserAddressDTO {
   @IsString()
   @MaxLength(200)
   readonly street: string;

   @IsString()
   @MaxLength(50)
   readonly ward: string;

   @IsString()
   @MaxLength(50)
   readonly province: string;

   @IsString()
   @MaxLength(50)
   readonly district: string;
}