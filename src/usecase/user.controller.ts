import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../persistence/user/user.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('Jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/get-list-user')
  getListUser() {
    return "Hehehe"
  }

  @Get('/get-user-detail/:id')
  getUserDetail() {
    return "user detail"
  }

}
