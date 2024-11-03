import { Controller, Get, Param } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { StatisticsService } from "./statistics.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Auth()
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @Get("main")
  async getMainStatistics() {
    return this.statisticsService.getMainStatistics();
  }

  @Auth()
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @Get("middle")
  async getMiddleStatistics() {
    return this.statisticsService.getMiddleStatistics();
  }
}
