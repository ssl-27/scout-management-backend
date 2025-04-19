import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post, UseGuards,
} from '@nestjs/common';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { MeetingService } from '../services/meeting-service';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('Meeting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeetingController {
  constructor(private readonly MeetingService: MeetingService) {}

  @Post()
  @RequireRoles({ group: UserTypeEnum.LEADER })
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.MeetingService.create(createMeetingDto);
  }

  @Get()
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER })
  findAll() {
    return this.MeetingService.findAll();
  }

  @Get(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER })
  findOne(@Param('id') id: string) {
    return this.MeetingService.findOne(id);
  }

  @Patch(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  update(
    @Param('id') id: string,
    @Body() createMeetingDto: Partial<CreateMeetingDto>,
  ) {
    return this.MeetingService.update(id, createMeetingDto);
  }

  @Delete(':id')
  @RequireRoles({ group: UserTypeEnum.ADMIN })
  remove(@Param('id') id: string) {
    return this.MeetingService.remove(id);
  }

  @Post(':id/complete')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  async completeMeeting(@Param('id') id: string, @CurrentUser() user) {
    return this.MeetingService.completeMeeting(id, user.userId);
  }
}