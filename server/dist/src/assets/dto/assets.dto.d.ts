export declare class CreateAssetDto {
    name: string;
    category: string;
    purchaseDate: string;
    purchasePrice: number;
    status: string;
    vendor?: string;
}
export declare class UpdateMaintenanceDto {
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    status: string;
}
