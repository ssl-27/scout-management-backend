import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { WorkSubmissionService } from '../services/work-submission.service';
import { CreateWorkSubmissionDto } from '../dto/create-work-submission.dto';
import { ReviewWorkSubmissionDto } from '../dto/review-work-submission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('work-submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkSubmissionController {
  constructor(private readonly workSubmissionService: WorkSubmissionService) {}

  @Post()
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  create(
    @Body() createWorkSubmissionDto: CreateWorkSubmissionDto,
    @CurrentUser() user
  ) {
    return this.workSubmissionService.create(createWorkSubmissionDto, user.userId);
  }

  @Get()
  @RequireRoles({ group: UserTypeEnum.LEADER })
  findAll() {
    return this.workSubmissionService.findAll();
  }

  @Get('pending')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  findPending() {
    return this.workSubmissionService.findPending();
  }

  @Get('my-submissions')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  findMySubmissions(@CurrentUser() user) {
    return this.workSubmissionService.findAllByScout(user.userId);
  }

  @Get('training-item/:id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  findByTrainingItem(@Param('id') id: string) {
    return this.workSubmissionService.findAllByRequirementId(id);
  }

  @Get(':id')
  @RequireRoles({ group: UserTypeEnum.MEMBER }, { group: UserTypeEnum.LEADER })
  findOne(@Param('id') id: string) {
    return this.workSubmissionService.findOne(id);
  }

  @Post(':id/review')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewWorkSubmissionDto,
    @CurrentUser() user
  ) {
    return this.workSubmissionService.review(id, reviewDto, user.userId);
  }

  @Delete(':id')
  @RequireRoles({ group: UserTypeEnum.MEMBER })
  delete(@Param('id') id: string, @CurrentUser() user) {
    return this.workSubmissionService.delete(id, user.userId);
  }
}