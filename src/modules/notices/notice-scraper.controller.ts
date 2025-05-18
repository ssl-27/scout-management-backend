import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NoticeScraperService } from './notice-scraper.service';

@Controller('scout-notices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticeScraperController {
  constructor(private readonly noticeScraperService: NoticeScraperService) {}

  @Get('scrape')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  async scrapeNotices(
    @Query('year') year: number = new Date().getFullYear(),
    @Query('month') month: number = new Date().getMonth() + 1,
  ) {
    await this.noticeScraperService.scrapeScoutNotices(year, month);
    return { message: 'Scout notices scraped successfully' };
  }
  @Get()
  @RequireRoles(
    { group: UserTypeEnum.LEADER },
    { group: UserTypeEnum.MEMBER },
    { group: UserTypeEnum.GUARDIAN },
  )
  async getNotices(
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.noticeScraperService.getScoutNotices(year, month, page, limit);
  }
}