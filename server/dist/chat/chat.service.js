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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRooms(userId) {
        return this.prisma.chatRoom.findMany({
            where: {
                participants: {
                    some: { userId }
                }
            },
            include: {
                participants: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
    }
    async isParticipant(roomId, userId) {
        if (!roomId || !userId)
            return false;
        const participant = await this.prisma.chatParticipant.findUnique({
            where: { roomId_userId: { roomId, userId } },
        });
        return Boolean(participant);
    }
    async getMessages(roomId, userId) {
        const participant = await this.prisma.chatParticipant.findUnique({
            where: { roomId_userId: { roomId, userId } }
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a participant in this room');
        }
        return this.prisma.chatMessage.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' }
        });
    }
    async createRoom(type, participantIds, name) {
        if (type === 'DIRECT' && participantIds.length === 2) {
            const existingRooms = await this.prisma.chatRoom.findMany({
                where: { type: 'DIRECT' },
                include: { participants: true }
            });
            const room = existingRooms.find(r => r.participants.length === 2 &&
                r.participants.every(p => participantIds.includes(p.userId)));
            if (room)
                return room;
        }
        return this.prisma.chatRoom.create({
            data: {
                type,
                name,
                participants: {
                    create: participantIds.map(userId => ({ userId }))
                }
            },
            include: { participants: true, messages: true }
        });
    }
    async sendMessage(roomId, senderId, content, type) {
        return this.prisma.chatMessage.create({
            data: {
                roomId,
                senderId,
                content,
                type,
                readBy: JSON.stringify([senderId])
            }
        });
    }
    async markAsRead(roomId, userId) {
        const unreadMessages = await this.prisma.chatMessage.findMany({
            where: {
                roomId,
                NOT: { readBy: { contains: userId } },
            },
        });
        for (const msg of unreadMessages) {
            let readByArray = [];
            try {
                readByArray = JSON.parse(msg.readBy);
            }
            catch (e) {
                readByArray = [];
            }
            if (!readByArray.includes(userId)) {
                readByArray.push(userId);
            }
            await this.prisma.chatMessage.update({
                where: { id: msg.id },
                data: { readBy: JSON.stringify(readByArray) },
            });
        }
        return { success: true };
    }
    async createTaskFromChat(roomId, userId, taskData) {
        const { assigneeId, dueDate, ...rest } = taskData;
        let assignedToEmpId = undefined;
        if (assigneeId) {
            const emp = await this.prisma.employee.findUnique({ where: { userId: assigneeId } });
            if (emp)
                assignedToEmpId = emp.id;
        }
        const task = await this.prisma.task.create({
            data: {
                ...rest,
                assignedTo: assignedToEmpId,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assignedBy: userId,
            },
        });
        return task;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map