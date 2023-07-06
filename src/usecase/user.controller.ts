import {
  Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, HttpStatus, UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../persistence/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { UpdateUserAddressDTO, UpdateUserDTO } from 'src/application/dto/user.dto';
import { Role } from 'src/domain/enums/roles.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/infrastructure/common/cloudinary/cloudinary.service';
@UseGuards(AuthGuard('Jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly cloudinary: CloudinaryService) { }

  @Roles(Role.Admin)
  @Get('/get-list-user')
  async getListUser(@Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.userService.getListUser(+pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list user succesfully")
  }

  @Roles(Role.Admin)
  @Get('/get-list-deleted-user')
  async getListDeletedUser(@Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.userService.getListDeletedUser(+pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list deleted user succesfully")
  }

  @Get('/get-user-detail/:id')
  async getUserDetail(@Param('id') userId: number) {
    let data = await this.userService.getUserDetail(+userId)
    return customResponse(data, HttpStatus.OK, "Get user detail successfully")
  }

  @Get('/search-user-by-email')
  async searchUserByEmail(@Query() query: any) {
    const { email } = query
    let data = await this.userService.searchUserByEmail(email)
    return customResponse(data, HttpStatus.OK, "Search user by email successfully")
  }

  @Post('/update-user-address/:id')
  async updateUserAddress(@Param('id') userId: number, @Body() body: UpdateUserAddressDTO) {
    await this.userService.updateUserAddress(body, +userId)
    return customResponse(null, HttpStatus.CREATED, "Update user's address successfully")
  }

  @Post('/update-user-infor/:id')
  async updateUserInfor(@Param('id') userId: number, @Body() body: UpdateUserDTO) {
    await this.userService.updateUserInformation(body, +userId)
    return customResponse(null, HttpStatus.CREATED, "User information has been updated")
  }

  @Post('/upload-user-avatar/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Param('id') userId: number) {
    const data = await this.cloudinary.uploadFile(file)
    await this.userService.uploadAvatar(data, +userId)
    return customResponse(null, HttpStatus.CREATED, "Avatar has been uploaded")
  }

  @Roles(Role.Admin)
  @Patch('/block-user/:id')
  async blockUser(@Param('id') userId: number) {
    await this.userService.blockUser(+userId)
    return customResponse(null, HttpStatus.OK, "Block user successfully")
  }

  @Roles(Role.Admin)
  @Patch('/change-user-role/:id')
  async updateUserRole(@Param('id') userId: number, @Query() query: any) {
    const { role } = query
    await this.userService.updateUserRole(+userId, role)
    return customResponse(null, HttpStatus.OK, "Change user's role successfully")
  }

  @Patch('/change-password/:id')
  async changePassword(@Param('id') userId: number, @Body() body: any) {
    await this.userService.changePassword(+userId, body)
    return customResponse(null, HttpStatus.OK, "Password changed successfully")
  }

  @Roles(Role.Admin)
  @Patch('/restore-user-account/:id')
  async restoreUserAccount(@Param('id') userId: number) {
    await this.userService.restoreUserAccount(+userId);
    return customResponse(null, HttpStatus.OK, "User restored successfully")
  }

  @Roles(Role.Admin)
  @Delete('/delete-user/:id')
  async tempDeleteUser(@Param('id') userId: number, @Query() query: any) {
    const { action } = query
    await this.userService.deleteUser(+userId, action)
    return customResponse(null, HttpStatus.OK, "User deleted successfully")
  }
}
