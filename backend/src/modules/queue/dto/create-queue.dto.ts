import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum QueueStatus {
  waiting = 'waiting',
  quality_check = 'quality_check',
  weighing = 'weighing',
  done = 'done',
}

export class CreateQueueDto {
  @IsInt()
  @Min(1)
  booking_id: number;

  @IsInt()
  @Min(1)
  centre_id: number;

  @IsEnum(QueueStatus)
  status?: QueueStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  called_at?: Date;
}
