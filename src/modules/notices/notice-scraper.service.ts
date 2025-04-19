import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScoutNotice } from '../../entities/notices/scout-notice.entity';

@Injectable()
export class NoticeScraperService {
  private readonly logger = new Logger(NoticeScraperService.name);

  constructor(
    @InjectRepository(ScoutNotice)
    private scoutNoticeRepository: Repository<ScoutNotice>,
  ) {}

  async scrapeScoutNotices(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1): Promise<void> {
    this.logger.log(`Scraping notices for year: ${year}, month: ${month}`);

    try {
      // Target URL - we're setting section[]=7 which corresponds to 童軍 (Scout section)
      const url = `https://www.scout.org.hk/tc/circulars-forms/circulars/index.html?type=&category=&year=${year}&month=${month}&section%5B%5D=7&submit=%E6%90%9C%E5%B0%8B`;

      // Make HTTP request
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        },
      });

      // Load HTML content into cheerio
      const $ = cheerio.load(response.data);

      // Find the table with notices
      const noticesTable = $('.basictable');

      // Extract notices from table rows
      const notices: Partial<ScoutNotice>[] = [];

      noticesTable.find('tbody tr').each((i, element) => {
        const cells = $(element).find('td');

        if (cells.length >= 6) {
          const issueDateStr = $(cells[0]).text().trim();
          const title = $(cells[1]).find('a').text().trim();
          const url = $(cells[1]).find('a').attr('href');
          const dueDateStr = $(cells[2]).text().trim();
          const targetAudience = $(cells[3]).text().trim();
          const department = $(cells[4]).text().trim();
          const category = $(cells[5]).text().trim();

          // Parse dates
          const issueDate = this.parseChineseDate(issueDateStr);
          const dueDate = dueDateStr === '--' ? null : this.parseChineseDate(dueDateStr);

          // Create notice object
          const notice: Partial<ScoutNotice> = {
            title,
            url: url ? `https://www.scout.org.hk${url}` : null,
            issueDate,
            dueDate,
            targetAudience,
            department,
            category,
            isImported: false,
          };

          notices.push(notice);
        }
      });

      this.logger.log(`Found ${notices.length} notices`);

      // Save notices to database
      for (const notice of notices) {
        // Check if notice already exists (by title and issue date)
        const existingNotice = await this.scoutNoticeRepository.findOne({
          where: {
            title: notice.title,
            issueDate: notice.issueDate,
          }
        });

        if (!existingNotice) {
          await this.scoutNoticeRepository.save(notice);
          this.logger.log(`Saved new notice: ${notice.title}`);
        }
      }

    } catch (error) {
      this.logger.error(`Error scraping notices: ${error.message}`);
      throw error;
    }
  }

  // Helper method to parse dates like "01/04/2025"
  private parseChineseDate(dateStr: string): Date {
    if (!dateStr || dateStr === '--') return null;

    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      this.logger.error(`Error parsing date: ${dateStr} - ${error.message}`);
      return null;
    }
  }

  async getScoutNotices(
    year?: number,
    month?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ notices: ScoutNotice[], total: number, page: number, pages: number }> {
    this.logger.log(`Retrieving notices for year: ${year}, month: ${month}, page: ${page}, limit: ${limit}`);

    // Build query conditions
    const where: any = {};

    if (year) {
      // For year filtering, we need to check if the issueDate falls within the specified year
      where.issueDate = year ?
        month ?
          // If both year and month are provided, filter for that specific month and year
          Between(
            new Date(year, month - 1, 1),
            new Date(year, month, 0)
          ) :
          // If only year is provided, filter for the entire year
          Between(
            new Date(year, 0, 1),
            new Date(year, 11, 31)
          ) :
        undefined;
    }

    // Get total count for pagination
    const total = await this.scoutNoticeRepository.count({ where });

    // Calculate pagination
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get notices with pagination
    const notices = await this.scoutNoticeRepository.find({
      where,
      order: { issueDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      notices,
      total,
      page,
      pages
    };
  }
}