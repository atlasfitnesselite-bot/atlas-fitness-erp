import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateMaintenanceDto } from './dto/assets.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.asset.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch assets');
    }
  }

  async create(createAssetDto: CreateAssetDto) {
    try {
      return await this.prisma.asset.create({
        data: {
          name: createAssetDto.name,
          category: createAssetDto.category,
          purchaseDate: createAssetDto.purchaseDate ? new Date(createAssetDto.purchaseDate) : new Date(),
          purchasePrice: createAssetDto.purchasePrice ? parseFloat(createAssetDto.purchasePrice.toString()) : 0,
          status: createAssetDto.status || 'ACTIVE',
          vendor: createAssetDto.vendor,
        },
      });
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new InternalServerErrorException('Failed to create asset');
    }
  }

  async updateMaintenance(id: string, updateMaintenanceDto: UpdateMaintenanceDto) {
    try {
      const asset = await this.prisma.asset.findUnique({ where: { id } });
      if (!asset) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }

      return await this.prisma.asset.update({
        where: { id },
        data: {
          lastMaintenanceDate: new Date(updateMaintenanceDto.lastMaintenanceDate),
          nextMaintenanceDate: new Date(updateMaintenanceDto.nextMaintenanceDate),
          status: updateMaintenanceDto.status,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update asset maintenance');
    }
  }
}
