import { IsDecimal, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProcurementDto {
  @IsInt()
  @Min(1)
  booking_id: number;

  @IsDecimal({ decimal_digits: '2' }, { message: 'actual_quantity must be a decimal number' })
  actual_quantity: number | string;

  @IsOptional()
  @IsString()
  quality_grade?: string | null;

  @IsDecimal({ decimal_digits: '2' }, { message: 'rate_applied must be a decimal number' })
  rate_applied: number | string;

  @IsDecimal({ decimal_digits: '2' }, { message: 'total_amount must be a decimal number' })
  total_amount: number | string;

  @IsOptional()
  @IsInt()
  @Min(1)
  procured_by?: number | null;
}
