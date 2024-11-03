import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";

export const Auth = () => {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard));
};
