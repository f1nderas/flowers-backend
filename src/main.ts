import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { initializeData } from "./init-data";

async function bootstrap() {
  try {
    console.log("Starting application...");
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    console.log("Cookie parser added");

    app.enableCors({
      origin: ["http://localhost:3000", "http://194.58.126.231:3000"],
      credentials: true,
      exposedHeaders: "set-cookie",
    });
    console.log("CORS enabled");

    await initializeData();
    console.log("Data initialization completed");

    await app.listen(5050);
    console.log("Server is running on port 5050");
  } catch (error) {
    console.error("Error during bootstrap:", error);
  }
}

bootstrap();
