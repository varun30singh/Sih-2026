import { PartialType } from '@nestjs/mapped-types';
import { CreateProcurementCentreDto } from './create-procurement-centre.dto';

export class UpdateProcurementCentreDto extends PartialType(
  CreateProcurementCentreDto,
) {}
