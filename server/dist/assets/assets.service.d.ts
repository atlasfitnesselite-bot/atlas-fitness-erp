import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateMaintenanceDto } from './dto/assets.dto';
export declare class AssetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        notes: string | null;
        category: string;
        purchaseDate: Date;
        purchasePrice: number;
        vendor: string | null;
        lastMaintenanceDate: Date | null;
        nextMaintenanceDate: Date | null;
    }[]>;
    create(createAssetDto: CreateAssetDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        notes: string | null;
        category: string;
        purchaseDate: Date;
        purchasePrice: number;
        vendor: string | null;
        lastMaintenanceDate: Date | null;
        nextMaintenanceDate: Date | null;
    }>;
    updateMaintenance(id: string, updateMaintenanceDto: UpdateMaintenanceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        notes: string | null;
        category: string;
        purchaseDate: Date;
        purchasePrice: number;
        vendor: string | null;
        lastMaintenanceDate: Date | null;
        nextMaintenanceDate: Date | null;
    }>;
}
