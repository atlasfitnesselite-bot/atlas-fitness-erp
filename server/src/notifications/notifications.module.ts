import { Module, Global } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationCronService } from './notifications.cron.service';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationCronService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
