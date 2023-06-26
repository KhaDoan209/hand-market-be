import { AuthLoginDTO, AuthRegisterDTO } from "src/application/dto/auth-dto/auth.dto";

export interface AuthRepository {
   login(userLogin: AuthLoginDTO): Promise<any>;
   register(userRegister: AuthRegisterDTO): Promise<any>;
   refresh(token: string): Promise<any>;
   logout(id: number): Promise<any>;
   checkExistedEmail(email: string): Promise<any>;
}