import { Injectable } from '@nestjs/common';
import { AuthLoginDTO, AuthRegisterDTO } from 'src/application/dto/auth-dto/auth.dto';
import { AuthRepository } from 'src/application/repositories/business/auth.repository';

@Injectable()
export class AuthService implements AuthRepository {
  login(userLogin: AuthLoginDTO): Promise<any> {
    return
  }
  register(userRegister: AuthRegisterDTO): Promise<any> {
    return
  }
}
