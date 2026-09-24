import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsPositive()
  slot_id: number;

  @IsInt()
  @IsPositive()
  crop_id: number;

  @IsNumber()
  @IsPositive()
  quantity_estimate: number;
}