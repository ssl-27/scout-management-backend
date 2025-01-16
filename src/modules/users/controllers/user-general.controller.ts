import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserGeneralService } from '../services/user-general.service';
import { CreateUserGeneralDto } from '../dto/create-user-general.dto';

@Controller('user-general')
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
  findMembers() {
    return this.userGeneralService.findMembers();
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