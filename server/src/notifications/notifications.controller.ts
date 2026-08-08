import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notifications.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.notificationsService.getUserNotifications(
      req.user.id,
      pageNumber,
      limitNumber,
      status,
    );
  }

  @Get('unread-count')
  async getUnreadCount(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
  ) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Put('read-all')
  async markAllAsRead(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
  ) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Put(':id/read')
  async markAsRead(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Delete('clear-all')
  async clearReadNotifications(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
  ) {
    return this.notificationsService.clearReadNotifications(req.user.id);
  }

  @Delete(':id')
  async deleteNotification(
    @Req() req: { user: { id: string; email: string; roles: string[] } },
    @Param('id') id: string,
  ) {
    return this.notificationsService.deleteNotification(id, req.user.id);
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  async createNotification(@Body() dto: CreateNotificationDto) {
    if (dto.targetRole) {
      return this.notificationsService.broadcastToRole(dto);
    }
    return this.notificationsService.createNotification(dto);
  }
}
