import { Injectable } from '@nestjs/common';
import { createErrorResponse, createSuccessResponse } from '../../common';

export interface Stockist {
  id: string;
  userId: string;
  businessName: string;
  createdAt: string;
}

@Injectable()
export class StockistsService {
  private readonly stockists: Stockist[] = [];

  findAll() {
    return createSuccessResponse(this.stockists);
  }

  findById(id: string) {
    return createSuccessResponse(this.stockists.find(stockist => stockist.id === id) || null);
  }

  create(stockistData: { userId?: string; businessName?: string }) {
    if (!stockistData.userId || !stockistData.businessName) {
      return createErrorResponse('userId and businessName are required');
    }

    const stockist: Stockist = {
      id: `stockist-${Date.now().toString().slice(-8)}`,
      userId: stockistData.userId,
      businessName: stockistData.businessName,
      createdAt: new Date().toISOString(),
    };

    this.stockists.push(stockist);
    return createSuccessResponse(stockist, 'Stockist created successfully');
  }
}