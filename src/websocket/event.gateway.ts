import { OnGatewayConnection, WebSocketGateway, WebSocketServer, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthUtilService } from "../shared/utils/auth-util/auth-utils.service";
import { PrismaService } from "../infrastructure/config/prisma/prisma/prisma.service";
import { Role } from "src/domain/enums/roles.enum";
import { ConfigService } from "@nestjs/config";
import { SocketMessage } from "src/domain/enums/socket-message.enum";
import { OrderStatus } from "src/domain/enums/order-status.enum";
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
         return null
      } catch (error) {
         console.error(`Error during disconnection: ${error.message}`);
      }
   }

   getSocketIdByUserId(userId: string): string | undefined {
      return this.userSocketMap.get(userId);
   }

   async joinRoom(id: number, roomId: string) {
      const socketId = this.getSocketIdByUserId(id.toString());
      if (socketId) {
         const socket = this.server.sockets.sockets.get(socketId);
         if (socket) {
            socket.join(roomId);
            console.log(`Account with socketId ${socketId} joined room ${roomId}`);
         }
      }
   }
   async leaveRoom(id: number, roomId: string) {
      const socketId = this.getSocketIdByUserId(id.toString());
      if (socketId) {
         const socket = this.server.sockets.sockets.get(socketId);
         if (socket) {
            socket.leave(roomId);
            console.log(`Account with socketId ${socketId} left room ${roomId}`);
         } else {
            console.log(`Socket not found for user with ID ${id}`);
         }
      } else {
         console.log(`Socket ID not found for user with ID ${id}`);
      }
   }
   @SubscribeMessage(SocketMessage.JoinRoom)
   async handleJoinRoom(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
      const { userId, role } = data;
      if (role === Role.Shipper) {
         const unresolvedOrder = await this.prisma.usePrisma().order.findFirst({
            where: {
               shipper_id: userId,
               status: OrderStatus.OutOfDelivery
            }
         })
         if (unresolvedOrder) {
            await this.joinRoom(userId, unresolvedOrder.room_id);
         } else {
            socket.join(Role.Shipper)
         }

      } else if (role === Role.User) {
         const orderList = await this.prisma.usePrisma().order.findMany({
            where: {
               user_id: userId,
               status: OrderStatus.OutOfDelivery
            }
         })
         if (orderList.length > 0) {
            for (const item of orderList) {
               await this.joinRoom(userId, item.room_id);
            }
         }
         socket.join(Role.User)
      } else {
         socket.join(Role.Shipper)
         socket.join(Role.User)
      }
      const rooms = this.server.sockets.adapter.rooms
      console.log(rooms);
   }

}


