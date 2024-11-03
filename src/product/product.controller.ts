import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ProductDto } from "./dto/product.dto";
import { ProductService } from "./product.service";
import { UserRole } from "@prisma/client";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("admin")
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async getAll(@Query("searchTerm") searchTerm?: string) {
    return this.productService.getAll(searchTerm);
  }

  @Get("user")
  async getAllForUser(@Query("searchTerm") searchTerm?: string) {
    return this.productService.getAllForUser(searchTerm);
  }

  @Get("by-id/:id")
  async getById(@Param("id") id: string) {
    return this.productService.getById(id);
  }

  @Get("by-category/:categoryId")
  async getByCategory(@Param("categoryId") categoryId: string) {
    return this.productService.getByCategory(categoryId);
  }

  @Get("most-popular")
  async getMostPopular() {
    return this.productService.getMostPopular();
  }

  @Get("similar/:id")
  async getSimilar(@Param("id") id: string) {
    return this.productService.getSimilar(id);
  }

  @Post()
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async create(@Body() dto: ProductDto) {
    return this.productService.create(dto);
  }

  @Put(":id")
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async update(@Param("id") id: string, @Body() dto: ProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(200)
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async delete(@Param("id") id: string) {
    return this.productService.delete(id);
  }

  @Patch(":id/visibility")
  @HttpCode(200)
  @Auth()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.CREATOR)
  async toggleVisibility(
    @Param("id") id: string,
    @Body("isVisible") isVisible: boolean
  ) {
    return this.productService.toggleVisibility(id, isVisible);
  }
}
