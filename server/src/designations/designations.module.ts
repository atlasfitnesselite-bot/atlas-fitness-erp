import { Module } from '@nestjs/common';
import { DesignationsController } from './designations.controller';
import { DesignationsService } from './designations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DesignationsController],
  providers: [DesignationsService],
  exports: [DesignationsService],
})
export class DesignationsModule {}
