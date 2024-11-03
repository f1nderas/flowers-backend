import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "src/user/decorators/user.decorator";
import { OrderDto } from "./dto/order.dto";
import { PaymentStatusDto } from "./dto/payment-status.dto";
import { OrderService } from "./order.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("place")
  @Auth()
  async checkout(@Body() dto: OrderDto, @CurrentUser("id") userId: string) {
    return this.orderService.createPayment(dto, userId);
  }

  @HttpCode(200)
  @Post("status")
  async updateStatus(@Body() dto: PaymentStatusDto) {
    return this.orderService.updateStatus(dto);
  }

  @Get()
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async getAll() {
    return this.orderService.getAll();
  }

  @Get(":id")
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async getOrderById(@Param("id") id: string) {
    const order = await this.orderService.getById(id);
    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }
    return order;
  }
}
