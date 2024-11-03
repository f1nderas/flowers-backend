import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "./decorators/user.decorator";
import { UserService } from "./user.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Get("profile")
  async getProfile(@CurrentUser("id") id: string) {
    return this.userService.getById(id);
  }

  @Auth()
  @Patch("profile/favorites/:productId")
  async toggleFavorite(
    @CurrentUser("id") userId: string,
    @Param("productId") productId: string
  ) {
    return this.userService.toggleFavorite(productId, userId);
  }

  @Auth()
  @Roles(UserRole.CREATOR, UserRole.ADMIN)
  @Patch(":userId/role")
  async assignRole(
    @CurrentUser("id") currentUser: string,
    @Param("userId") targetUserId: string,
    @Body("role") role: UserRole
  ) {
    return this.userService.assignRole(currentUser, targetUserId, role);
  }

  @Auth()
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @Get()
  async getAllUsers() {
    return this.userService.getAll();
  }
}
