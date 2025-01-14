import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { MeetingService } from '../services/meeting-service';

@Controller('Meeting')
export class MeetingController {
  constructor(private readonly MeetingService: MeetingService) {}

  @Post()
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.MeetingService.create(createMeetingDto);
  }

  @Get()
  findAll() {
    return this.MeetingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.MeetingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() createMeetingDto: Partial<CreateMeetingDto>,
  ) {
    return this.MeetingService.update(id, createMeetingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.MeetingService.remove(id);
  }
}