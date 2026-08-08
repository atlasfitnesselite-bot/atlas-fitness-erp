import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notifications.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, page?: string, limit?: string, status?: string): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            status: string;
            userId: string;
            type: string;
            title: string;
            message: string;
        }[];
        total: number;
        unreadCount: number;
    }>;
    getUnreadCount(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<{
        unreadCount: number;
    }>;
    markAllAsRead(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<{
        message: string;
    }>;
    markAsRead(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        userId: string;
        type: string;
        title: string;
        message: string;
    }>;
    clearReadNotifications(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<{
        message: string;
    }>;
    deleteNotification(req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        userId: string;
        type: string;
        title: string;
        message: string;
    }>;
    createNotification(dto: CreateNotificationDto): Promise<{
        message: string;
    }>;
}
