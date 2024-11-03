import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ProductService } from "src/product/product.service";
import { ReviewDto } from "./dto/review.dto";
import { UserRole } from "@prisma/client";

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService
  ) {}

  async getAll() {
    return this.prisma.review.findMany({
      include: {
        user: true,
        product: true,
      },
    });
  }

  async getById(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        user: true,
      },
    });

    if (!review)
      throw new NotFoundException(
        "Отзыв не найден или вы не являетесь его владельцем"
      );

    return review;
  }

  async create(userId: string, productId: string, dto: ReviewDto) {
    await this.productService.getById(productId);

    return this.prisma.review.create({
      data: {
        ...dto,
        product: {
          connect: {
            id: productId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException("Отзыв не найден");
    }

    const allowedRole: UserRole[] = [
      UserRole.CREATOR,
      UserRole.ADMIN,
      UserRole.MANAGER,
    ];

    if (review.userId !== userId && !allowedRole.includes(userRole)) {
      throw new ForbiddenException("У вас нет прав для удаления этого отзыва");
    }

    return this.prisma.review.delete({
      where: {
        id,
      },
    });
  }
}
