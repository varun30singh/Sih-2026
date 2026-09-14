import { Controller, Get, Param } from '../../common';
import { CentresService } from './centres.service';

@Controller('centres')
export class CentresController {
  constructor(private readonly centresService: CentresService) {}

  @Get()
  getAllCentres() {
    return this.centresService.findAll();
  }

  @Get(':id')
  getCentreById(@Param('id') id: string) {
    return this.centresService.findById(id);
  }
}
