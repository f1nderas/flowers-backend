import { IsNumber, IsString } from "class-validator";

export class UpdateStoreDto {
  @IsString({
    message: "Название обязательно",
  })
  title: string;

  @IsString({
    message: "Описание обязательно",
  })
  description: string;

  @IsNumber()
  deliveryPrice: number;

  @IsNumber()
  minOrderPrice: number;
}
