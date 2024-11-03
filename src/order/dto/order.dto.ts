import { EnumOrderStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class OrderDto {
  @IsOptional()
  @IsEnum(EnumOrderStatus, {
    message: "Статус заказа обязателен",
  })
  status: EnumOrderStatus;

  @IsArray({
    message: "В заказе нет ни одного товара",
  })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString({ message: "Телефон должен быть строкой" })
  @IsNotEmpty({ message: "Телефон обязателен" })
  phone: string;

  @IsString({ message: "Адрес должен быть строкой" })
  @IsNotEmpty({ message: "Адрес обязателен" })
  address: string;

  @IsOptional()
  @IsString({ message: "Комментарий должен быть строкой" })
  comment?: string;
}

export class OrderItemDto {
  @IsNumber({}, { message: "Количество должно быть числом" })
  quantity: number;

  @IsNumber({}, { message: "Цена должна быть числом" })
  price: number;

  @IsString({ message: "ID продукта должен быть строкой" })
  productId: string;
}
