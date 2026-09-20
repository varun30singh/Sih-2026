import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { user_role } from '../../../generated/prisma/client';

export class CreateUserDto {
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(user_role)
  role: user_role;

  @IsOptional()
  @IsString()
  preferred_language?: string;
}
