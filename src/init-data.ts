import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { StoreService } from "./store/store.service";
import { UserService } from "./user/user.service";
import { PrismaService } from "./prisma.service";
import { hash } from "argon2";
import { UserRole } from "@prisma/client";

export async function initializeData() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const storeService = app.get(StoreService);
    const userService = app.get(UserService);
    const prismaService = app.get(PrismaService);

    const existingStore = await prismaService.store.findFirst();
    if (!existingStore) {
      await storeService.create({
        title: "Вальс Цветов",
        description: "Магазин цветов емае",
        minOrderPrice: 1000,
        deliveryPrice: 300,
      });
      console.log("Магазин создан");
    }

    const creatorEmail = process.env.CREATOR_EMAIL || "creator@example.com";
    const existingCreator = await userService.getByEmail(creatorEmail);
    if (!existingCreator) {
      const password = process.env.CREATOR_PASSWORD || "89011215601";

      await userService.create(
        {
          email: creatorEmail,
          password: password,
          name: "Создатель",
        },
        UserRole.CREATOR
      );
      console.log("Пользователь с ролью CREATOR создан");
    }

    await app.close();
  } catch (error) {
    console.error("Error during data initialization:", error);
    throw error;
  }
}
