import { OnGatewayConnection, WebSocketGateway, WebSocketServer, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "./persistence/auth/auth.service";
import { AuthUtilService } from "./shared/utils/auth-util/auth-utils.service";
import { EnvironmentConfigService } from "./infrastructure/config/environment/environment/environment.service";

@WebSocketGateway(8081, {
   cors: true
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
   @WebSocketServer() server: Server;
   constructor(private readonly authUtilService: AuthUtilService, private readonly configService: EnvironmentConfigService) {
   }

   @SubscribeMessage('message')
   async handleMessage(socket: Socket, @MessageBody() data) {
      console.log(data);
   }
   afterInit(server: any) {
   }

   async handleConnection(socket: Socket): Promise<any> {
      const access_token: any = socket.handshake.headers.access_token
      if (access_token) {
         try {
            const { email } = await this.authUtilService.getDecodedToken(access_token, this.configService.getJwtSecret()).data
            socket.data.email = email
            return email
         } catch (error) {

         }
      } else {
         socket.disconnect()
      }
   }

   async handleDisconnect(@ConnectedSocket() socket: Socket) {
      console.log(`socket disconnect`);
   }
}