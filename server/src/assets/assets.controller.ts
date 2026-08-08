import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateMaintenanceDto } from './dto/assets.dto';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@Controller('assets')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @Roles('OWNER', 'MANAGER')
  async findAll() {
    return await this.assetsService.findAll();
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  async create(@Body() createAssetDto: CreateAssetDto) {
    return await this.assetsService.create(createAssetDto);
  }

  @Put(':id/maintenance')
  @Roles('OWNER', 'MANAGER')
  async updateMaintenance(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    return await this.assetsService.updateMaintenance(id, updateMaintenanceDto);
  }
}
