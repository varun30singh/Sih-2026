import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProcurementCentreDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsInt()
  @Min(1)
  capacity_per_slot: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  processing_rate?: number | null;
}
