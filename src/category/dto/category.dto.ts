import { IsNotEmpty, IsString } from "class-validator";

export class CategoryDto {
  @IsString({
    message: "Название обязательно",
  })
  title: string;

  @IsString({
    message: "Описание обязательно",
  })
  description: string;

  @IsString({
    message: "Фотография обязательна",
  })
  @IsNotEmpty({
    each: true,
    message: "Путь к картинке не может быть пустым",
  })
  picture: string;
}
