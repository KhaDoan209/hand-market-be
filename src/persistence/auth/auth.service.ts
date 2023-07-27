import { Injectable, Inject } from '@nestjs/common';
import { AuthLoginDTO, AuthRegisterDTO } from 'src/application/dto/auth.dto';
import { AuthRepository } from 'src/application/repositories/business/auth.repository';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/domain/enums/roles.enum';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { PrismaEnum } from 'src/domain/enums/prisma.enum';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environment/environment.service';
import { JwtService } from '@nestjs/jwt';
import { generateAccessToken, generateRefreshToken, revertToken } from 'src/shared/utils/custom-functions/custom-token';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist';
import { Cache } from 'cache-manager'
import { MailerService } from '@nestjs-modules/mailer';
import { StripeService } from 'src/infrastructure/common/stripe/stripe.service';

@Injectable()
export class AuthService implements AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: EnvironmentConfigService,
    private readonly mailService: MailerService = null,
    @Inject(CACHE_MANAGER) private cache: Cache = null,
    private readonly stripe: StripeService = null
  ) {
  }

  async login(userLogin: AuthLoginDTO): Promise<any> {
    const { email, password } = userLogin
    const user = await this.prisma.usePrisma().user.findFirst({
      where: {
        email,
      },
      include: {
        Address: true
      }
    })
    const isMatched = await bcrypt.compare(password, user.password)
    if (isMatched) {
      const access_token = await generateAccessToken(this.jwtService, this.configService, user);
      const refresh_token = await generateRefreshToken(this.jwtService, this.configService, user);
      if (user.stripe_customer_id === null) {
        const { id } = await this.stripe.createStripeCustomer(user.first_name, user.last_name, user.email)
        await this.prisma.usePrisma().user.update({
          where: {
            id: user.id
          },
          data: {
            stripe_customer_id: id
          }
        })
      }
      await this.prisma.usePrisma().user.update({
        where: {
          email,
        },
        data: {
          refresh_token: refresh_token
        }
      })
      return {
        access_token,
        refresh_token,
        userToResponse: user
      }
    }
  }

  async register(userRegister: AuthRegisterDTO): Promise<any> {
    const { first_name, last_name, email, password } = userRegister
    const hashPassword = await bcrypt.hash(password, 10)
    const newAccount = {
      first_name,
      last_name,
      email,
      password: hashPassword,
      role: Role.User
    }
    await this.prisma.create('User', newAccount)
    await this.mailService.sendMail({
      to: newAccount.email,
      subject: "Welcome to the Hand Market, enjoy your shopping !",
      template: './welcome',
      context: {
        name: `${newAccount.first_name} ${newAccount.last_name}`
      }
    })
    const listUser = await this.prisma.usePrisma().user.findMany({
      where: {
        id: {
          gt: 0
        }
      },
    })
    await this.cache.set("list_user", listUser)
  }

  async refresh(refresh_token: string): Promise<any> {
    const tokenDecoded = await this.jwtService.verify(refresh_token, {
      secret: this.configService.getRefreshSecret()
    })
    const user = await this.prisma.usePrisma().user.findFirst({
      where: {
        email: tokenDecoded.data.email
      }
    })
    if (user) {
      if (user.refresh_token !== null) {

        if (refresh_token === user.refresh_token) {
          const access_token = await generateAccessToken(this.jwtService, this.configService, user);
          return {
            access_token,
          }
        } else {
          return "Refresh token không hợp lệ"
        }
      } else {
        return "Refresh token không tồn tại"
      }
    } else {
      return "User không tồn tại"
    }
  }

  async logout(id: number): Promise<any> {
    return await this.prisma.usePrisma().user.update({
      where: {
        id,
      }, data: {
        refresh_token: null
      }
    })
  }

  async checkExistedEmail(email: string): Promise<any> {
    let isExisted = await this.prisma.usePrisma().user.findFirst({
      where: {
        email
      }
    })
    if (isExisted) {
      return false
    } else {
      return true
    }
  }
}  