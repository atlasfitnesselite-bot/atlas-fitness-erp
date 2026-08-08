"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        try {
            return await this.prisma.asset.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch assets');
        }
    }
    async create(createAssetDto) {
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
        }
        catch (error) {
            console.error('Error creating asset:', error);
            throw new common_1.InternalServerErrorException('Failed to create asset');
        }
    }
    async updateMaintenance(id, updateMaintenanceDto) {
        try {
            const asset = await this.prisma.asset.findUnique({ where: { id } });
            if (!asset) {
                throw new common_1.NotFoundException(`Asset with ID ${id} not found`);
            }
            return await this.prisma.asset.update({
                where: { id },
                data: {
                    lastMaintenanceDate: new Date(updateMaintenanceDto.lastMaintenanceDate),
                    nextMaintenanceDate: new Date(updateMaintenanceDto.nextMaintenanceDate),
                    status: updateMaintenanceDto.status,
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update asset maintenance');
        }
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map