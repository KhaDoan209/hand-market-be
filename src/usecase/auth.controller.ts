import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from '../persistence/auth/auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/login')
  create(@Body() createAuthDto) {
    return "login check"
    // return this.authService.login(createAuthDto);
  }



}
