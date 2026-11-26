"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const jwt_1 = require("@nestjs/jwt");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    chatService;
    jwtService;
    server;
    constructor(chatService, jwtService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
    }
    handleConnection(client) {
        try {
            const authHeader = client.handshake.headers?.authorization;
            const rawToken = (typeof client.handshake.auth?.token === 'string' && client.handshake.auth.token) ||
                (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
                    ? authHeader.slice(7)
                    : undefined);
            if (!rawToken) {
                client.disconnect(true);
                return;
            }
            const payload = this.jwtService.verify(rawToken);
            if (!payload?.sub) {
                client.disconnect(true);
                return;
            }
            client.data.userId = payload.sub;
        }
        catch {
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        void client;
    }
    async handleJoinRoom(data, client) {
        const userId = client.data.userId;
        if (!userId || !(await this.chatService.isParticipant(data?.roomId, userId))) {
            return;
        }
        await client.join(data.roomId);
    }
    async handleLeaveRoom(data, client) {
        if (data?.roomId) {
            await client.leave(data.roomId);
        }
    }
    async handleSendMessage(data, client) {
        const userId = client.data.userId;
        if (!userId || !data?.roomId || !data?.content) {
            return;
        }
        if (!(await this.chatService.isParticipant(data.roomId, userId))) {
            return;
        }
        const message = await this.chatService.sendMessage(data.roomId, userId, data.content, data.type || 'TEXT');
        this.server.to(data.roomId).emit('newMessage', message);
    }
    async handleTyping(data, client) {
        const userId = client.data.userId;
        if (!userId || !data?.roomId) {
            return;
        }
        if (!(await this.chatService.isParticipant(data.roomId, userId))) {
            return;
        }
        client.to(data.roomId).emit('typing', { senderId: userId, isTyping: Boolean(data.isTyping) });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
                : true,
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map