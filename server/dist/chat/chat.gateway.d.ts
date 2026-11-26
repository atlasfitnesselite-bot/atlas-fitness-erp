import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly jwtService;
    server: Server;
    constructor(chatService: ChatService, jwtService: JwtService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        roomId: string;
    }, client: Socket): Promise<void>;
    handleLeaveRoom(data: {
        roomId: string;
    }, client: Socket): Promise<void>;
    handleSendMessage(data: {
        roomId: string;
        senderId?: string;
        content: string;
        type?: string;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        roomId: string;
        senderId?: string;
        isTyping: boolean;
    }, client: Socket): Promise<void>;
}
