import { AuthLoginDTO, AuthRegisterDTO, ContactFormDTO, FacebookLoginDTO, GoogleLoginDTO } from "src/application/dto/auth.dto";

export interface AuthRepository {
   login(userLogin: AuthLoginDTO): Promise<any>;
   register(userRegister: AuthRegisterDTO): Promise<any>;
   refresh(token: string): Promise<any>;
   logout(id: number): Promise<any>;
   loginWithFacebook(data: FacebookLoginDTO): Promise<any>;
   loginWithGoogle(data: GoogleLoginDTO): Promise<any>;
   checkExistedEmail(email: string): Promise<any>;
   sendContactForm(body: ContactFormDTO): Promise<any>;
}