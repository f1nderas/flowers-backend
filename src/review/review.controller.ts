import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "src/user/decorators/user.decorator";
import { ReviewDto } from "./dto/review.dto";
import { ReviewService } from "./review.service";
import { UserRole } from "@prisma/client";

@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Auth()
  @Get()
  async getAll() {
    return this.reviewService.getAll();
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post(":productId")
  async create(
    @CurrentUser("id") userId: string,
    @Param("productId") productId: string,
    @Body() dto: ReviewDto
  ) {
    return this.reviewService.create(userId, productId, dto);
  }

  @HttpCode(200)
  @Auth()
  @Delete(":id")
  async delete(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") userRole: UserRole
  ) {
    return this.reviewService.delete(id, userId, userRole);
  }
}
