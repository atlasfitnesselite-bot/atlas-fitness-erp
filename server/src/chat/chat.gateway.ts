import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
      : true,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers?.authorization;
      const rawToken =
        (typeof client.handshake.auth?.token === 'string' && client.handshake.auth.token) ||
        (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : undefined);

      if (!rawToken) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify<{ sub: string }>(rawToken);
      if (!payload?.sub) {
        client.disconnect(true);
        return;
      }

      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    void client;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !(await this.chatService.isParticipant(data?.roomId, userId))) {
      return;
    }
    await client.join(data.roomId);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.roomId) {
      await client.leave(data.roomId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: string; senderId?: string; content: string; type?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !data?.roomId || !data?.content) {
      return;
    }
    if (!(await this.chatService.isParticipant(data.roomId, userId))) {
      return;
    }

    const message = await this.chatService.sendMessage(
      data.roomId,
      userId,
      data.content,
      data.type || 'TEXT',
    );
    this.server.to(data.roomId).emit('newMessage', message);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { roomId: string; senderId?: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !data?.roomId) {
      return;
    }
    if (!(await this.chatService.isParticipant(data.roomId, userId))) {
      return;
    }
    client.to(data.roomId).emit('typing', { senderId: userId, isTyping: Boolean(data.isTyping) });
  }
}
