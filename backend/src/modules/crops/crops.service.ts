import { Injectable } from '@nestjs/common';
import { createErrorResponse, createSuccessResponse } from '../../common';

export interface Crop {
  id: string;
  name: string;
  mspRate: number;
  unit: string;
}

@Injectable()
export class CropsService {
  private nextCropId = 1;

  private crops: Crop[] = [
    { id: 'crop-wheat', name: 'Wheat', mspRate: 2425, unit: 'per quintal' },
    { id: 'crop-paddy', name: 'Paddy/Rice', mspRate: 2369, unit: 'per quintal' },
    { id: 'crop-maize', name: 'Maize', mspRate: 2400, unit: 'per quintal' },
  ];

  findAll() {
    return createSuccessResponse(this.crops);
  }

  findById(id: string) {
    const crop = this.crops.find((item) => item.id === id);
    return crop
      ? createSuccessResponse(crop)
      : createErrorResponse('CROP_NOT_FOUND', `No crop exists with id '${id}'`);
  }

  create(cropData: Partial<Crop>) {
    const validationError = this.validateCropData(cropData);
    if (validationError) {
      return createErrorResponse(validationError);
    }

    const crop: Crop = {
      id: `crop-${Date.now().toString(36)}-${this.nextCropId++}`,
      name: cropData.name!.trim(),
      mspRate: cropData.mspRate!,
      unit: cropData.unit!.trim(),
    };

    this.crops.push(crop);
    return createSuccessResponse(crop, 'Crop created successfully');
  }

  update(id: string, cropData: Partial<Crop>) {
    const cropIndex = this.crops.findIndex((item) => item.id === id);
    if (cropIndex === -1) {
      return createErrorResponse('CROP_NOT_FOUND', `No crop exists with id '${id}'`);
    }

    const updatedData = {
      name: cropData?.name === undefined ? this.crops[cropIndex].name : cropData.name,
      mspRate: cropData?.mspRate === undefined ? this.crops[cropIndex].mspRate : cropData.mspRate,
      unit: cropData?.unit === undefined ? this.crops[cropIndex].unit : cropData.unit,
    };
    const validationError = this.validateCropData(updatedData);
    if (validationError) {
      return createErrorResponse(validationError);
    }

    const updatedCrop: Crop = {
      id,
      name: updatedData.name!.trim(),
      mspRate: updatedData.mspRate!,
      unit: updatedData.unit!.trim(),
    };
    this.crops[cropIndex] = updatedCrop;
    return createSuccessResponse(updatedCrop, 'Crop updated successfully');
  }

  remove(id: string) {
    const cropIndex = this.crops.findIndex((item) => item.id === id);
    if (cropIndex === -1) {
      return createErrorResponse('CROP_NOT_FOUND', `No crop exists with id '${id}'`);
    }

    const [deletedCrop] = this.crops.splice(cropIndex, 1);
    return createSuccessResponse(deletedCrop, 'Crop deleted successfully');
  }

  private validateCropData(cropData: Partial<Crop>) {
    if (!cropData || typeof cropData !== 'object') {
      return 'Crop data is required';
    }
    if (typeof cropData.name !== 'string' || cropData.name.trim().length === 0) {
      return 'Crop name is required';
    }
    if (typeof cropData.mspRate !== 'number' || !Number.isFinite(cropData.mspRate) || cropData.mspRate <= 0) {
      return 'mspRate must be a positive number';
    }
    if (typeof cropData.unit !== 'string' || cropData.unit.trim().length === 0) {
      return 'Crop unit is required';
    }
    return null;
  }
}