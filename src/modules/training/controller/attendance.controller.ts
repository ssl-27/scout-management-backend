// src/controllers/attendance.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Query, Patch } from '@nestjs/common';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { AttendanceService } from '../services/attendance.service';
import { CreateBatchAttendanceDto } from '../dto/create-batch-attendance.dto';
import { PatrolNamesEnum } from '../../../common/enum/patrol-names.enum';

@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post('batch')
  createBatch(@Body() createBatchAttendanceDto: CreateBatchAttendanceDto) {
    return this.attendanceService.createBatch(createBatchAttendanceDto);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Get('meeting/:id')
  findByMeeting(@Param('id') id: string) {
    return this.attendanceService.findByMeeting(id);
  }

  @Get('meeting/:meetingId/users')
  async findByMeetingAndUsers(
    @Param('meetingId') meetingId: string,
    @Query('userIds') userIds: string
  ) {
    // Split the comma-separated string into an array
    const userIdArray = userIds.split(',');
    return this.attendanceService.findByMeetingAndUsers(meetingId, userIdArray);
  }

  @Get('meeting/:meetingId/patrol/:patrolId')
  async findByMeetingAndPatrol(
    @Param('meetingId') meetingId: string,
    @Param('patrolId') patrolId: PatrolNamesEnum
  ) {
    return this.attendanceService.findByMeetingAndPatrol(meetingId, patrolId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}