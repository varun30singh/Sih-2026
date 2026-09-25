import { IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  farmer_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  farmerId?: number;

  @IsInt()
  @IsPositive()
  slot_id: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  slotId?: number;

  @IsInt()
  @IsPositive()
  crop_id: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cropId?: number;

  @IsNumber()
  @IsPositive()
  quantity_estimate: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantityEstimate?: number;

  @IsOptional()
  @IsString()
  token_number?: string;

  @IsOptional()
  @IsString()
  tokenNumber?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  booked_by?: string;

  @IsOptional()
  @IsString()
  bookedBy?: string;
}