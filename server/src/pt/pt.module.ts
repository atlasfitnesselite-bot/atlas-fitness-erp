import { Module } from '@nestjs/common';
import { PtController } from './pt.controller';
import { PtService } from './pt.service';

@Module({
  controllers: [PtController],
  providers: [PtService],
})
export class PtModule {}
