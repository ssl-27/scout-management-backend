// src/modules/badge/controllers/badge.controllers.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { BadgeService } from '../services/badge.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('badges')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  getAllBadges() {
    return this.badgeService.getAllBadges();
  }

  @Get('requirements')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  getAllRequirements() {
    return this.badgeService.getAllRequirements();
  }

  @Get('proficiency/interest')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER }
  )
  getInterestProficiencyBadges() {
    return this.badgeService.getInterestProficiencyBadges();
  }

  @Get('scout/:scoutId')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  getMemberBadges(@Param('scoutId') scoutId: string) {
    return this.badgeService.getMemberBadges(scoutId);
  }

  @Get('scout/:scoutId/progress')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  getScoutProgress(@Param('scoutId') scoutId: string) {
    return this.badgeService.getScoutBadgeProgress(scoutId);
  }

  @Get('scout/:scoutId/badge/:badgeId/requirements')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  getMemberRequirements(
    @Param('scoutId') scoutId: string,
    @Param('badgeId') badgeId: string,
  ) {
    return this.badgeService.getMemberRequirements(scoutId, badgeId);
  }

  @Post('scout/:scoutId/badge/:badgeId/award')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  awardBadge(
    @Param('scoutId') scoutId: string,
    @Param('badgeId') badgeId: string,
    @Body() data: { completionDate: Date, remarks?: string },
    @CurrentUser() user,
  ) {
    return this.badgeService.awardBadge(
      scoutId,
      badgeId,
      user.userId,
      data.completionDate,
      data.remarks,
    );
  }

  @Post('scout/:scoutId/requirement/:requirementId/complete')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  completeRequirement(
    @Param('scoutId') scoutId: string,
    @Param('requirementId') requirementId: string,
    @Body() data: {
      completionDate: Date,
      remarks?: string,
      selectedOption?: string,
      usedBadgeIds?: string[],
      evidenceFiles?: any[],
    },
    @CurrentUser() user,
  ) {
    return this.badgeService.completeRequirement(
      scoutId,
      requirementId,
      user.userId,
      data.completionDate,
      data.remarks,
      data.selectedOption,
      data.usedBadgeIds,
      data.evidenceFiles,
    );
  }

  @Get('scout/:scoutId/badge/:badgeId/completion-check')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  checkBadgeCompletion(
    @Param('scoutId') scoutId: string,
    @Param('badgeId') badgeId: string,
  ) {
    return this.badgeService.checkBadgeCompletion(scoutId, badgeId);
  }

  @Get('requirements/incomplete')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  getIncompleteBadgeRequirements(@CurrentUser() user) {
    return this.badgeService.getIncompleteBadgeRequirementsForScout(user.userId);
  }

  @Get('/scout/:scoutId/requirements/incomplete')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  getScoutsIncompleteBadgeRequirements(    @Param('scoutId') scoutId: string,) {
    return this.badgeService.getIncompleteBadgeRequirementsForScout(scoutId);
  }

  @Get('scout/:scoutId/badge/:badgeId/detailed-progress')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  getDetailedBadgeProgress(
    @Param('scoutId') scoutId: string,
    @Param('badgeId') badgeId: string,
  ) {
    return this.badgeService.getDetailedBadgeProgress(scoutId, badgeId);
  }

  @Get(':id')
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN }
  )
  getBadgeById(@Param('id') id: string) {
    return this.badgeService.getBadgeById(id);
  }
}