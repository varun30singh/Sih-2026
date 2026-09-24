import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { user_role } from '../../../generated/prisma/client';
import { REGISTRABLE_ROLES } from '../../users/registration';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(REGISTRABLE_ROLES)
  role: user_role;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  preferred_language?: string;

  @ValidateIf((body) => body.role === user_role.farmer)
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ValidateIf((body) => body.role === user_role.farmer)
  @IsOptional()
  @IsString()
  id_proof?: string;

  @ValidateIf((body) => body.role === user_role.farmer)
  @IsOptional()
  @IsString()
  village?: string;

  @ValidateIf((body) => body.role === user_role.stockist)
  @IsOptional()
  @IsString()
  business_name?: string;
}