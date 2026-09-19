import { Injectable } from '@nestjs/common';
import { createErrorResponse, createSuccessResponse } from '../../common';

export interface RetailUser {
  id: string;
  userId: string;
  createdAt: string;
}

@Injectable()
export class RetailUsersService {
  private readonly retailUsers: RetailUser[] = [];

  findAll() {
    return createSuccessResponse(this.retailUsers);
  }

  findById(id: string) {
    return createSuccessResponse(this.retailUsers.find(user => user.id === id) || null);
  }

  create(retailUserData: { userId?: string }) {
    if (!retailUserData.userId) {
      return createErrorResponse('userId is required');
    }

    const retailUser: RetailUser = {
      id: `retail-user-${Date.now().toString().slice(-8)}`,
      userId: retailUserData.userId,
      createdAt: new Date().toISOString(),
    };

    this.retailUsers.push(retailUser);
    return createSuccessResponse(retailUser, 'Retail user created successfully');
  }
}