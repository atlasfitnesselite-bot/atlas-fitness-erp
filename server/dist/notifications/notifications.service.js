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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
let NotificationsService = class NotificationsService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async getUserNotifications(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (status && status !== 'All') {
            where.status = status;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip: Number(skip),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { userId, status: 'Unread' } }),
        ]);
        return { notifications, total, unreadCount };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, status: 'Unread' },
        });
        return { unreadCount: count };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to modify this notification');
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'Read' },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, status: 'Unread' },
            data: { status: 'Read' },
        });
        return { message: 'All notifications marked as read' };
    }
    async deleteNotification(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this notification');
        }
        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
    async clearReadNotifications(userId) {
        const result = await this.prisma.notification.deleteMany({
            where: { userId, status: 'Read' },
        });
        return { message: `Cleared ${result.count} read notifications` };
    }
    async createNotification(dto) {
        if (!dto.userId) {
            throw new common_1.BadRequestException('User ID is required to create a direct notification');
        }
        const notification = await this.prisma.notification.create({
            data: {
                title: dto.title,
                message: dto.message,
                type: dto.type || 'General',
                userId: dto.userId,
                status: 'Unread',
            },
        });
        this.eventsGateway.server.emit('new_notification', notification);
        return notification;
    }
    async broadcastToRole(dto) {
        if (!dto.targetRole) {
            throw new common_1.BadRequestException('Target Role is required to broadcast');
        }
        const users = await this.prisma.user.findMany({
            where: {
                userRoles: {
                    some: {
                        role: {
                            name: dto.targetRole,
                        },
                    },
                },
            },
            select: { id: true },
        });
        if (users.length === 0) {
            return { message: `No users found with role ${dto.targetRole}` };
        }
        const data = users.map((u) => ({
            title: dto.title,
            message: dto.message,
            type: dto.type || 'General',
            userId: u.id,
            status: 'Unread',
        }));
        const result = await this.prisma.notification.createMany({
            data,
        });
        this.eventsGateway.server.emit('new_notification', {
            title: dto.title,
            message: dto.message,
            type: dto.type || 'General',
            targetRole: dto.targetRole,
            createdAt: new Date(),
        });
        return { message: `Broadcasted notification to ${result.count} users` };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map