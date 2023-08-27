import { Controller, Get, Res, Req, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from '../persistence/auth/auth.service';
import { AuthLoginDTO, AuthRegisterDTO, FacebookLoginDTO, GoogleLoginDTO } from 'src/application/dto/auth.dto';
import { ValidationPipe } from '@nestjs/common/pipes';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { HttpStatus } from '@nestjs/common/enums';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/login')
  async login(@Body(new ValidationPipe()) body: AuthLoginDTO, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token, userToResponse } = await this.authService.login(body);
    res.cookie('access_token', access_token, { httpOnly: false, expires: new Date(Date.now() + 30 * 60 * 1000) });
    res.cookie('refresh_token', refresh_token, { httpOnly: false, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    return customResponse(userToResponse, HttpStatus.OK, "Login successfully")
  }

  @Post('/register')
  async register(@Body(new ValidationPipe()) body: AuthRegisterDTO) {
    let data = await this.authService.register(body)
    return customResponse(data, HttpStatus.CREATED, "Register successfully")
  }

  @Post('/reset')
  async reset(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refresh_token } = req.cookies
    const { access_token } = await this.authService.refresh(refresh_token)
    res.cookie('access_token', access_token, { httpOnly: true, expires: new Date(Date.now() + 30 * 60 * 1000) });
    return customResponse(null, HttpStatus.OK, "Reset new token successfully")
  }

  @Post('/logout/:id')
  async logout(@Param('id') id: number, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(+id);
    res.cookie('access_token', null, { httpOnly: false, expires: new Date(Date.now() + 500) });
    res.cookie('refresh_token', null, { httpOnly: false, expires: new Date(Date.now() + 500) });
    return customResponse
      (null, HttpStatus.OK, "Logout successfully")
  }

  @Get('/check-existed-email')
  async checkExistedEmail(@Query() query: any) {
    const { email } = query
    const data = await this.authService.checkExistedEmail(email)
    if (data) {
      return customResponse(data, HttpStatus.OK, "The email address can be used")
    } else {
      return customResponse(data, HttpStatus.OK, "The email address is existed")
    }
  }

  @Post('/facebook-login')
  async loginWithFacebook(@Body() body: FacebookLoginDTO, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token, userToResponse } = await this.authService.loginWithFacebook(body);
    res.cookie('access_token', access_token, { httpOnly: false, expires: new Date(Date.now() + 30 * 60 * 1000), });
    res.cookie('refresh_token', refresh_token, { httpOnly: false, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), });
    return customResponse(userToResponse, HttpStatus.OK, "Login successfully")
  }

  @Post('/google-login')
  async loginWithGoogle(@Body() body: GoogleLoginDTO, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token, userToResponse } = await this.authService.loginWithGoogle(body);
    res.cookie('access_token', access_token, { httpOnly: false, expires: new Date(Date.now() + 30 * 60 * 1000), });
    res.cookie('refresh_token', refresh_token, { httpOnly: false, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), });
    return customResponse(userToResponse, HttpStatus.OK, "Login successfully")
  }
}
