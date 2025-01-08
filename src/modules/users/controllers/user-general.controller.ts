import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserGeneralService } from '../services/user-general.service';
import { CreateUserGeneralDto } from '../dto/create-user-general.dto';

@Controller('user-general')
export class UserGeneralController {
  constructor(private readonly userGeneralService: UserGeneralService){}

  @Post()
  create(@Body() createUserGeneralDto: CreateUserGeneralDto) {
    return this.userGeneralService.create(createUserGeneralDto);
  }
  //
  // @Get()
  // findAll() {
  //   return this.userGeneralService.findAll();
  // }
}