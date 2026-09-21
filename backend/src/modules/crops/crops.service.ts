import { Injectable } from '@nestjs/common';

@Injectable()
export class CropsService {
  private crops = [
    {
      id: 1,
      name: 'Wheat',
      mspRate: 2275,
      unit: 'quintal',
    },
    {
      id: 2,
      name: 'Rice',
      mspRate: 2300,
      unit: 'quintal',
    },
  ];

  findAll() {
    return this.crops;
  }

  findOne(id: number) {
    return this.crops.find((crop) => crop.id === id) || null;
  }

  create(data: {
    name: string;
    mspRate: number;
    unit: string;
  }) {
    const crop = {
      id: this.crops.length + 1,
      name: data.name,
      mspRate: data.mspRate,
      unit: data.unit,
    };

    this.crops.push(crop);
    return crop;
  }

  update(
    id: number,
    data: {
      name?: string;
      mspRate?: number;
      unit?: string;
    },
  ) {
    const crop = this.findOne(id);

    if (!crop) {
      return null;
    }

    if (data.name !== undefined) crop.name = data.name;
    if (data.mspRate !== undefined) crop.mspRate = data.mspRate;
    if (data.unit !== undefined) crop.unit = data.unit;

    return crop;
  }

  remove(id: number) {
    const index = this.crops.findIndex((crop) => crop.id === id);

    if (index === -1) {
      return null;
    }

    return this.crops.splice(index, 1)[0];
  }
}