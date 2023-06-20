import { Module } from '@nestjs/common';
import { AuthUtilService } from './auth-utils.service';

@Module({
   providers: [AuthUtilService],
   exports: [AuthUtilService],
})
export class AuthUtilsModule { }
