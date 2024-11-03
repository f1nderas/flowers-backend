import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class OrderItemService {
  constructor(private prisma: PrismaService) {}

  async getAllOrderItems() {
    return this.prisma.orderItem.findMany({
      include: {
        product: true,
        order: true,
      },
    });
  }

  async getOrderItemById(orderItemId: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        product: true,
        order: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException(
        `Позиция заказа с ID ${orderItemId} не найдена`
      );
    }

    return orderItem;
  }
}
