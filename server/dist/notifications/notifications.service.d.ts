import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { EventsGateway } from '../events/events.gateway';
export declare class NotificationsService {
    private readonly prisma;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    getUserNotifications(userId: string, page?: number, limit?: number, status?: string): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            userId: string;
            status: string;
            type: string;
            title: string;
            message: string;
        }[];
        total: number;
        unreadCount: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        type: string;
        title: string;
        message: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        type: string;
        title: string;
        message: string;
    }>;
    clearReadNotifications(userId: string): Promise<{
        message: string;
    }>;
    createNotification(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        type: string;
        title: string;
        message: string;
    }>;
    broadcastToRole(dto: CreateNotificationDto): Promise<{
        message: string;
    }>;
}
