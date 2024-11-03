import { ICapturePayment, YooCheckout } from "@a2seven/yoo-checkout";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EnumOrderStatus } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { OrderDto } from "./dto/order.dto";
import { PaymentStatusDto } from "./dto/payment-status.dto";

const checkout = new YooCheckout({
  shopId: process.env["YOOKASSA_SHOP_ID"],
  secretKey: process.env["YOOKASSA_SECRET_KEY"],
});

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createPayment(dto: OrderDto, userId: string) {
    const validItems = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product) {
        if (product.price === item.price) {
          validItems.push({
            quantity: item.quantity,
            price: item.price,
            product: {
              connect: {
                id: item.productId,
              },
            },
          });
        } else {
          throw new BadRequestException(
            `Цена товара с ID ${item.productId} изменилась`
          );
        }
      } else {
        console.warn(
          `Товар с ID ${item.productId} не найден и был удален из заказа.`
        );
      }
    }

    if (validItems.length === 0) {
      throw new BadRequestException("Все товары в заказе отсутствуют.");
    }

    if (!dto.phone || !dto.address) {
      throw new BadRequestException(
        "Телефон и адрес обязательны для заполнения."
      );
    }

    const store = await this.prisma.store.findFirst();

    if (!store) {
      throw new BadRequestException("Магазин не найден.");
    }

    const { minOrderPrice, deliveryPrice } = store;

    let total = dto.items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    if (total < minOrderPrice) {
      throw new BadRequestException(
        `Минимальная сумма заказа должна быть не менее ${minOrderPrice} руб.`
      );
    }

    total += deliveryPrice;

    const order = await this.prisma.order.create({
      data: {
        status: dto.status,
        items: {
          create: validItems,
        },
        total,
        phone: dto.phone,
        address: dto.address,
        comment: dto.comment || "",
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    try {
      const payment = await checkout.createPayment({
        amount: {
          value: total.toFixed(2),
          currency: "RUB",
        },
        payment_method_data: {
          type: "bank_card",
        },
        confirmation: {
          type: "redirect",
          return_url: `${process.env.CLIENT_URL}/thanks`,
        },
        description: `Оплата заказа в магазине. Id заказа: #${order.id}`,
      });
      return payment;
    } catch (error) {
      throw new BadRequestException("Ошибка при создании платежа");
    }
  }

  async updateStatus(dto: PaymentStatusDto) {
    if (dto.event === "payment.waiting_for_capture") {
      const capturePayment: ICapturePayment = {
        amount: {
          value: dto.object.amount.value,
          currency: dto.object.amount.currency,
        },
      };

      return checkout.capturePayment(dto.object.id, capturePayment);
    }

    if (dto.event === "payment.succeeded") {
      const orderId = dto.object.description.split("#")[1];

      const updatedOrder = await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: EnumOrderStatus.PAYED,
        },
      });

      return true;
    }

    return true;
  }

  async getAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        user: true,
      },
    });
  }

  async getById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${orderId} не найден`);
    }

    return order;
  }
}
