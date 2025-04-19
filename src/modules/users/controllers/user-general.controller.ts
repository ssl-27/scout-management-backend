import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserGeneralService } from '../services/user-general.service';
import { CreateUserGeneralDto } from '../dto/create-user-general.dto';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScoutSectionRankEnum } from '../../../common/enum/scout-section-rank.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('user-general')
@UseGuards(JwtAuthGuard)
export class UserGeneralController {
  constructor(private readonly userGeneralService: UserGeneralService){}


  @Post()
  create(@Body() createUserGeneralDto: CreateUserGeneralDto) {
    return this.userGeneralService.create(createUserGeneralDto);
  }

  @Get()
  findAll() {
    return this.userGeneralService.findAll();
  }

  @Get("members")
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
  )
  findMembers(
  ) {
    return this.userGeneralService.findMembers();
  }

  @Get('members/patrol/:patrol')
  @RequireRoles({
    group: UserTypeEnum.MEMBER,
    roles: [
      ScoutSectionRankEnum.PL,
      ScoutSectionRankEnum.APL,
      ScoutSectionRankEnum.SPL,
    ],
  },)
  findMembersByPatrol(@Param("patrol") patrol: string, @CurrentUser() user) {
    return this.userGeneralService.findPatrolMembers(patrol);
  }


  @Get("leaders")
  findLeaders() {
    return this.userGeneralService.findLeaders();
  }

  @Get("children")
  @RequireRoles(
    { group: UserTypeEnum.GUARDIAN }
  )
  findGuardianChildren(@CurrentUser() user) {
    return this.userGeneralService.findGuardianChildren(user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userGeneralService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() createUserGeneralDto: Partial<CreateUserGeneralDto>) {
    return this.userGeneralService.update(id, createUserGeneralDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userGeneralService.remove(id);
  }

}