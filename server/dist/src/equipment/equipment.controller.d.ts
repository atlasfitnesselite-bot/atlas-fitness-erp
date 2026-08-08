import { EquipmentService } from './equipment.service';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
    getEquipment(category?: string, status?: string, location?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        category: string;
        location: string | null;
        equipmentId: string;
        brand: string | null;
        model: string | null;
        purchaseDate: Date | null;
        purchasePrice: number | null;
        warrantyExpiry: Date | null;
        lastServiceDate: Date | null;
        nextServiceDate: Date | null;
        qrCode: string | null;
    }[]>;
    createEquipment(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        category: string;
        location: string | null;
        equipmentId: string;
        brand: string | null;
        model: string | null;
        purchaseDate: Date | null;
        purchasePrice: number | null;
        warrantyExpiry: Date | null;
        lastServiceDate: Date | null;
        nextServiceDate: Date | null;
        qrCode: string | null;
    }>;
    updateEquipment(id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        category: string;
        location: string | null;
        equipmentId: string;
        brand: string | null;
        model: string | null;
        purchaseDate: Date | null;
        purchasePrice: number | null;
        warrantyExpiry: Date | null;
        lastServiceDate: Date | null;
        nextServiceDate: Date | null;
        qrCode: string | null;
    }>;
    getFaultReports(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        equipmentId: string;
        resolvedAt: Date | null;
        reportedBy: string;
        severity: string;
        technicianNotes: string | null;
    }[]>;
    reportFault(id: string, data: any, req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        equipmentId: string;
        resolvedAt: Date | null;
        reportedBy: string;
        severity: string;
        technicianNotes: string | null;
    }>;
    resolveFault(faultId: string, technicianNotes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string;
        equipmentId: string;
        resolvedAt: Date | null;
        reportedBy: string;
        severity: string;
        technicianNotes: string | null;
    }>;
}
