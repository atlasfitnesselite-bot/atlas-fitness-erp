import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateMaintenanceDto } from './dto/assets.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
