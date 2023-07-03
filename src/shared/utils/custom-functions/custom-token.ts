import { EnvironmentConfigService } from "src/infrastructure/config/environment/environment/environment.service"

export const generateAccessToken = async (jwtService: any, configService: EnvironmentConfigService, object: any) => {
   let data = {
      email: object.email,
      password: object.password,
      role: object.role
   }
   return await jwtService.signAsync({ data: data }, { expiresIn: configService.getJwtExpired(), secret: configService.getJwtSecret() })
}

export const generateRefreshToken = async (jwtService: any, configService: any, object: any) => {
   let data = {
      email: object.email,
      password: object.password
   }
   return await jwtService.signAsync({ data: data }, { expiresIn: configService.getRefreshExpired(), secret: configService.getRefreshSecret() })
}

export const revertToken = (token: string) => {
   return token.split('').reverse().join('')
}

export const calculateRemainingTime = (token: any) => {
   const currentTimestamp = new Date().getTime();
   if (token) {
      const tokenExpirationTimestamp = token.exp * 1000;
      const timeRemaining = tokenExpirationTimestamp - currentTimestamp;
      const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
      return minutesRemaining
   } else {
      return null
   }

}