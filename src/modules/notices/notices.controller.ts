// src/modules/notices/notices.controllers.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NoticesService } from './notices.service';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@Controller('notices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post('generate')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  async generateContent(@Body() createNoticeDto: CreateNoticeDto) {
    const generatedContent = await this.noticesService.generateNoticeContent(createNoticeDto);
    return { content: generatedContent };
  }

  @Post()
  @RequireRoles({ group: UserTypeEnum.LEADER })
  create(@Body() createNoticeDto: CreateNoticeDto, @CurrentUser() user) {
    return this.noticesService.create(createNoticeDto, user.userId);
  }

  @Get()
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER }, { group: UserTypeEnum.GUARDIAN })
  findAll() {
    return this.noticesService.findAll();
  }

  @Get(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER }, { group: UserTypeEnum.GUARDIAN })
  findOne(@Param('id') id: string) {
    return this.noticesService.findOne(id);
  }

  @Patch(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  update(@Param('id') id: string, @Body() updateNoticeDto: Partial<CreateNoticeDto>) {
    return this.noticesService.update(id, updateNoticeDto);
  }

  @Delete(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  remove(@Param('id') id: string) {
    return this.noticesService.remove(id);
  }

  @Post(':id/send')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  async sendNotice(@Param('id') id: string) {
    return this.noticesService.sendNotice(id);
  }
}