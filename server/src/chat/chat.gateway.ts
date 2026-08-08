import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.roomId);
    console.log(`Client ${client.id} joined room ${data.roomId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.roomId);
    console.log(`Client ${client.id} left room ${data.roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: string; senderId: string; content: string; type?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendMessage(
      data.roomId,
      data.senderId,
      data.content,
      data.type || 'TEXT',
    );
    this.server.to(data.roomId).emit('newMessage', message);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: string; senderId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('typing', { senderId: data.senderId, isTyping: data.isTyping });
  }
}
