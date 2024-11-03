import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

import { hash } from "argon2";
import { AuthDto } from "src/auth/dto/auth.dto";
import { UserRole } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        favorites: {
          include: {
            category: true,
          },
        },
        orders: true,
      },
    });

    return user;
  }

  async getByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        favorites: true,
        orders: true,
      },
    });

    return user;
  }

  async toggleFavorite(productId: string, userId: string) {
    const user = await this.getById(userId);

    const isExists = user.favorites.some((product) => product.id === productId);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        favorites: {
          [isExists ? "disconnect" : "connect"]: {
            id: productId,
          },
        },
      },
    });

    return true;
  }

  async create(dto: AuthDto, role: UserRole = UserRole.USER) {
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await hash(dto.password),
        role: role,
      },
    });
  }

  async assignRole(
    currentUserId: string,
    targetUserId: string,
    role: UserRole
  ) {
    const currentUser = await this.getById(currentUserId);
    const targetUser = await this.getById(targetUserId);

    if (!currentUser)
      throw new ForbiddenException("Текущий пользователь не найден");
    if (!targetUser) throw new ForbiddenException("Пользователь не найден");

    if (currentUserId === targetUserId) {
      throw new ForbiddenException("Вы не можете изменить свою роль");
    }

    if (currentUser.role !== UserRole.CREATOR) {
      const roleHierarchy: Record<UserRole, number> = {
        [UserRole.USER]: 1,
        [UserRole.MANAGER]: 2,
        [UserRole.ADMIN]: 3,
        [UserRole.CREATOR]: 4,
      };

      if (roleHierarchy[currentUser.role] <= roleHierarchy[targetUser.role]) {
        throw new ForbiddenException(
          "Вы не можете изменять роль этого пользователя"
        );
      }
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });
  }

  async getAll() {
    return this.prisma.user.findMany({
      include: {
        favorites: true,
        orders: true,
      },
    });
  }
}
