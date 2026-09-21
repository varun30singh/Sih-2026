import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  private orders: Order[] = [
    {
      id: 1,
      listingId: 101,
      buyerId: 201,
      brokerId: 301,
      quantity: 10,
      amount: 25000,
      status: 'PENDING',
      createdAt: new Date(),
    },
  ];

  findAll() {
    return this.orders;
  }

  findOne(id: number) {
    return this.orders.find((order) => order.id === id) || null;
  }

  create(data: CreateOrderDto) {
    const order: Order = {
      id: this.orders.length
        ? Math.max(...this.orders.map((order) => order.id)) + 1
        : 1,
      listingId: data.listingId,
      buyerId: data.buyerId,
      brokerId: data.brokerId,
      quantity: data.quantity,
      amount: data.amount,
      status: data.status || 'PENDING',
      createdAt: new Date(),
    };

    this.orders.push(order);
    return order;
  }

  update(id: number, data: UpdateOrderDto) {
    const order = this.findOne(id);

    if (!order) {
      return null;
    }

    if (data.listingId !== undefined) order.listingId = data.listingId;
    if (data.buyerId !== undefined) order.buyerId = data.buyerId;
    if (data.brokerId !== undefined) order.brokerId = data.brokerId;
    if (data.quantity !== undefined) order.quantity = data.quantity;
    if (data.amount !== undefined) order.amount = data.amount;
    if (data.status !== undefined) order.status = data.status;

    return order;
  }

  remove(id: number) {
    const index = this.orders.findIndex((order) => order.id === id);

    if (index === -1) {
      return null;
    }

    return this.orders.splice(index, 1)[0];
  }
}