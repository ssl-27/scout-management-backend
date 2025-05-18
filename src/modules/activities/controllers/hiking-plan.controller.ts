// src/modules/activities/controllers/hiking-plan.controllers.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { HikingPlanService } from '../services/hiking-plan.service';
import { CreateHikingPlanDto } from '../dto/create-hiking-plan.dto';
import { UpdateHikingPlanDto } from '../dto/update-hiking-plan.dto';
import { CheckInOutDto } from '../dto/check-in-out.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('hiking-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HikingPlanController {
  constructor(private readonly hikingPlanService: HikingPlanService) {}

  @Post()
  @RequireRoles({ group: UserTypeEnum.MEMBER }, { group: UserTypeEnum.LEADER })
  create(@Body() createHikingPlanDto: CreateHikingPlanDto) {
    return this.hikingPlanService.create(createHikingPlanDto);
  }

  @Get()
  @RequireRoles({ group: UserTypeEnum.LEADER })
  findAll() {
    return this.hikingPlanService.findAll();
  }

  @Get('my-plans')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  findMyPlans(@CurrentUser() user) {
    return this.hikingPlanService.findAllForScout(user.userId);
  }

  @Get('my-supervised')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  findSupervisedPlans(@CurrentUser() user) {
    return this.hikingPlanService.findAllForSupervisor(user.userId);
  }

  @Get(':id')
  @RequireRoles({ group: UserTypeEnum.MEMBER }, { group: UserTypeEnum.LEADER })
  findOne(@Param('id') id: string) {
    return this.hikingPlanService.findOne(id);
  }

  @Patch(':id')
  @RequireRoles({ group: UserTypeEnum.MEMBER }, { group: UserTypeEnum.LEADER })
  update(@Param('id') id: string, @Body() updateHikingPlanDto: UpdateHikingPlanDto) {
    return this.hikingPlanService.update(id, updateHikingPlanDto);
  }

  @Delete(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  remove(@Param('id') id: string) {
    return this.hikingPlanService.remove(id);
  }

  @Post('check-in')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  checkIn(@CurrentUser() user, @Body() checkInDto: CheckInOutDto) {
    return this.hikingPlanService.checkIn(user.userId, checkInDto);
  }

  @Post('check-out')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  checkOut(@CurrentUser() user, @Body() checkOutDto: CheckInOutDto) {
    return this.hikingPlanService.checkOut(user.userId, checkOutDto);
  }


}