import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateSlotDto {
  @IsInt()
  @Min(1)
  centre_id: number;

  @IsInt()
  @Min(1)
  crop_id: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  start_time: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  end_time: Date;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  @Min(0)
  booked_count?: number;
}
