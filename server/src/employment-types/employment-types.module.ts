import { Module } from '@nestjs/common';
import { EmploymentTypesController } from './employment-types.controller';
import { EmploymentTypesService } from './employment-types.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmploymentTypesController],
  providers: [EmploymentTypesService],
  exports: [EmploymentTypesService],
})
export class EmploymentTypesModule {}
