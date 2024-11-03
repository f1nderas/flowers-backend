import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { OrderItemService } from "./order-item.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("orders-item")
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Get()
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async getAllOrderItems() {
    return this.orderItemService.getAllOrderItems();
  }

  @Get(":id")
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async getOrderItemById(@Param("id") id: string) {
    const orderItem = await this.orderItemService.getOrderItemById(id);
    if (!orderItem) {
      throw new NotFoundException(`Позиция заказа с ID ${id} не найдена`);
    }
    return orderItem;
  }
}
