import { OnGatewayConnection, WebSocketGateway, WebSocketServer, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthUtilService } from "../shared/utils/auth-util/auth-utils.service";
import { PrismaService } from "../infrastructure/config/prisma/prisma/prisma.service";
import { Role } from "src/domain/enums/roles.enum";
import { ConfigService } from "@nestjs/config";
import { PrismaEnum } from "src/domain/enums/prisma.enum";
import { User } from "@prisma/client";
@WebSocketGateway(8081, {
   cors: true
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
   private userSocketMap: Map<string, string> = new Map();
   private readonly userRooms: Map<number, string[]> = new Map<number, string[]>();
   @WebSocketServer() server: Server;
   constructor(private readonly prisma: PrismaService) {
   }

   afterInit(server: any) {
   }

   async handleConnection(socket: Socket): Promise<any> {
      const authUtil = new AuthUtilService()
      const config = new ConfigService()
      const refresh_token: any = socket.handshake.headers.refresh_token
      if (refresh_token) {
         try {
            const { id, email } = await authUtil.getDecodedToken(refresh_token, config.get('REFRESH_SECRECT_KEY')).data
            socket.data
            this.userSocketMap.set(id.toString(), socket.id);
            await this.prisma.usePrisma().user.update({
               where: {
                  id,
               },
               data: {
                  socket_id: socket.id
               }
            })
            return id
         } catch (error) {
            return null
         }
      } else {
         socket.disconnect()
      }
   }

   async handleDisconnect(@ConnectedSocket() socket: Socket) {
      try {
         const refresh_token: any = socket.handshake.headers.refresh_token
         const authUtil = new AuthUtilService()
         const config = new ConfigService()
         if (refresh_token) {
            const { id } = await authUtil.getDecodedToken(refresh_token, config.get('REFRESH_SECRECT_KEY')).data
            socket.data
            this.userSocketMap.delete(id);
            await this.prisma.usePrisma().user.update({
               where: {
                  id,
               },
               data: {
                  socket_id: null
               }
            })
         }
         const socketsInRoom = this.server.sockets.adapter.rooms.get("user-room");
         console.log("List socket remain", socketsInRoom);
         return socket.disconnect()
      } catch (error) {
         console.error(`Error during disconnection: ${error.message}`);
      }
   }

   getSocketIdByUserId(userId: string): string | undefined {
      return this.userSocketMap.get(userId);
   }

   @SubscribeMessage('join_room')
   handleJoinRoom(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
      const { userId, role } = data;
      if (role === Role.Shipper) {
         socket.join(Role.Shipper)
      } else if (role === Role.User) {
         socket.join(Role.User)
      } else {
         socket.join(Role.Shipper)
         socket.join(Role.User)
      }
      const rooms = this.server.sockets.adapter.rooms
      console.log(rooms);
   }

}


