import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('leader-stats')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  async getLeaderStats(@CurrentUser() user) {
    return this.dashboardService.getLeaderStats(user.userId);
  }

  @Get('member-stats')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  async getMemberStats(@CurrentUser() user) {
    return this.dashboardService.getMemberStats(user.userId);
  }

  @Get('recent-activities')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER }
  )
  async getRecentActivities(@CurrentUser() user) {
    return this.dashboardService.getRecentActivities(user.userId, user.group);
  }
}