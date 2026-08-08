import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

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

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, status: 'Unread' },
    });
    return { unreadCount: count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this notification',
      );
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'Read' },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, status: 'Unread' },
      data: { status: 'Read' },
    });
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this notification',
      );
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async clearReadNotifications(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId, status: 'Read' },
    });
    return { message: `Cleared ${result.count} read notifications` };
  }

  async createNotification(dto: CreateNotificationDto) {
    if (!dto.userId) {
      throw new BadRequestException(
        'User ID is required to create a direct notification',
      );
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

  async broadcastToRole(dto: CreateNotificationDto) {
    if (!dto.targetRole) {
      throw new BadRequestException('Target Role is required to broadcast');
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

    // Also fetch the created ones to emit to everyone, or just emit a generic broadcast
    this.eventsGateway.server.emit('new_notification', {
      title: dto.title,
      message: dto.message,
      type: dto.type || 'General',
      targetRole: dto.targetRole,
      createdAt: new Date(),
    });

    return { message: `Broadcasted notification to ${result.count} users` };
  }
}
