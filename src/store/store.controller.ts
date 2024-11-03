import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "src/user/decorators/user.decorator";
import { UpdateStoreDto } from "./dto/update-store.dto";
import { StoreService } from "./store.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("stores")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Auth()
  @Get()
  async get() {
    return this.storeService.get();
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Roles(UserRole.CREATOR)
  @Put()
  async update(@Body() dto: UpdateStoreDto) {
    return this.storeService.update(dto);
  }
}
