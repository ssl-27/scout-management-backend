// src/controllers/attendance.controllers.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { AttendanceService } from '../services/attendance.service';
import { CreateBatchAttendanceDto } from '../dto/create-batch-attendance.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { ScoutSectionRankEnum } from '../../../common/enum/scout-section-rank.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @RequireRoles(
    {
      group: UserTypeEnum.MEMBER,
      roles: [
        ScoutSectionRankEnum.PL,
        ScoutSectionRankEnum.APL,
        ScoutSectionRankEnum.SPL,
      ],
    },
    { group: UserTypeEnum.LEADER },
  )
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
  ) {
    return this.attendanceService.markAttendance(createAttendanceDto);
  }

  @Post('batch')
  @RequireRoles(
    {
      group: UserTypeEnum.MEMBER,
      roles: [ScoutSectionRankEnum.PL, ScoutSectionRankEnum.APL],
    },
    { group: UserTypeEnum.LEADER },
  )
  createBatch(
    @Body() createBatchAttendanceDto: CreateBatchAttendanceDto,
    @CurrentUser() user,
  ) {
    return this.attendanceService.createBatch(createBatchAttendanceDto, user);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('my-records')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  findMyAttendance(@CurrentUser() user) {
    return this.attendanceService.findAllForMember(user.userId);
  }

  @Get('meeting/:id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  findByMeeting(@Param('id') id: string, @CurrentUser() user) {
    return this.attendanceService.findByMeeting(id, user);
  }

  @Get('meeting/:meetingId/users')
  @RequireRoles(
    {
      group: UserTypeEnum.MEMBER,
      roles: [ScoutSectionRankEnum.PL, ScoutSectionRankEnum.APL],
    },
    { group: UserTypeEnum.LEADER },
  )
  async findByMeetingAndUsers(
    @Param('meetingId') meetingId: string,
    @Query('userIds') userIds: string,
    @CurrentUser() user,
  ) {
    const userIdArray = userIds.split(',');
    return this.attendanceService.findByMeetingAndUsers(
      meetingId,
      userIdArray,
      user,
    );
  }

  @Get('meeting/:meetingId/patrol/')
  @RequireRoles({
    group: UserTypeEnum.MEMBER,
    roles: [
      ScoutSectionRankEnum.PL,
      ScoutSectionRankEnum.APL,
      ScoutSectionRankEnum.SPL,
    ],
  })
  async findByMeetingAndPatrol(
    @Param('meetingId') meetingId: string,
    @CurrentUser() user,
  ) {
    return this.attendanceService.findByMeetingAndPatrol(
      meetingId,
      user.patrol,
    );
  }

  @Get('children')
  @RequireRoles({ group: UserTypeEnum.GUARDIAN })
  async getChildrenAttendance(@CurrentUser() user) {
    return this.attendanceService.findAllForGuardianChildren(user.userId);
  }

  @Patch(':id')
  @RequireRoles(
    {
      group: UserTypeEnum.MEMBER,
      roles: [ScoutSectionRankEnum.PL, ScoutSectionRankEnum.APL],
    },
    { group: UserTypeEnum.LEADER },
  )
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto, user);
  }

  @Delete(':id')
  @RequireRoles({ group: UserTypeEnum.ADMIN })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.attendanceService.remove(id, user);
  }

  @Get(':id')
  @RequireRoles(
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.GUARDIAN },
  )
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.attendanceService.findOne(id, user);
  }
}