import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CafeService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    getMenu(): Promise<({
        transactions: {
            id: string;
            createdAt: Date;
            notes: string | null;
            type: string;
            recordedBy: string | null;
            itemId: string;
            quantity: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        price: number;
        stock: number;
        minStock: number;
        imageUrl: string | null;
        isAvailable: boolean;
    })[]>;
    createMenuItem(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        price: number;
        stock: number;
        minStock: number;
        imageUrl: string | null;
        isAvailable: boolean;
    }>;
    updateMenuItem(id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        price: number;
        stock: number;
        minStock: number;
        imageUrl: string | null;
        isAvailable: boolean;
    }>;
    getInventoryTransactions(): Promise<({
        item: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            price: number;
            stock: number;
            minStock: number;
            imageUrl: string | null;
            isAvailable: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        type: string;
        recordedBy: string | null;
        itemId: string;
        quantity: number;
    })[]>;
    updateStock(data: {
        itemId: string;
        quantity: number;
        type: string;
        notes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        type: string;
        recordedBy: string | null;
        itemId: string;
        quantity: number;
    }>;
    getSuppliers(): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        address: string | null;
        category: string | null;
        contactName: string | null;
        phone: string | null;
    }[]>;
    createSupplier(data: any): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        address: string | null;
        category: string | null;
        contactName: string | null;
        phone: string | null;
    }>;
    updateSupplier(id: string, data: any): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        address: string | null;
        category: string | null;
        contactName: string | null;
        phone: string | null;
    }>;
    getOrders(): Promise<({
        member: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            branch: string | null;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string;
            joiningDate: Date;
            aadhaarNumber: string | null;
            memberId: string;
            accessCardId: string | null;
            occupation: string | null;
            altMobile: string | null;
            passportNumber: string | null;
        } | null;
        items: ({
            item: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                category: string;
                price: number;
                stock: number;
                minStock: number;
                imageUrl: string | null;
                isAvailable: boolean;
            };
        } & {
            id: string;
            notes: string | null;
            price: number;
            itemId: string;
            quantity: number;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        memberId: string | null;
        totalAmount: number;
        prepTime: number | null;
        orderNumber: string;
        customerName: string | null;
        tableNumber: string | null;
    })[]>;
    createOrder(data: {
        items: any[];
        customerName?: string;
        memberId?: string;
        tableNumber?: string;
    }): Promise<{
        items: {
            id: string;
            notes: string | null;
            price: number;
            itemId: string;
            quantity: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        memberId: string | null;
        totalAmount: number;
        prepTime: number | null;
        orderNumber: string;
        customerName: string | null;
        tableNumber: string | null;
    }>;
    updateOrderStatus(id: string, data: {
        status: string;
        prepTime?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        memberId: string | null;
        totalAmount: number;
        prepTime: number | null;
        orderNumber: string;
        customerName: string | null;
        tableNumber: string | null;
    }>;
    getReportsSummary(): Promise<{
        totalSalesToday: number;
        totalOrdersToday: number;
        topSellingItems: {
            name: string;
            quantity: number;
        }[];
    }>;
    submitChecklist(data: any): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        items: string;
        type: string;
        completedBy: string;
    }>;
    getChecklists(): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        items: string;
        type: string;
        completedBy: string;
    }[]>;
    submitPrepLog(data: any): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        expiryDate: Date | null;
        quantity: number;
        itemName: string;
        preparedBy: string;
    }>;
    getPrepLogs(): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        expiryDate: Date | null;
        quantity: number;
        itemName: string;
        preparedBy: string;
    }[]>;
    submitHygieneLog(data: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        notes: string | null;
        area: string;
        cleanedBy: string;
    }>;
    getHygieneLogs(): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        notes: string | null;
        area: string;
        cleanedBy: string;
    }[]>;
    getCafeExpenses(): Promise<({
        category: {
            id: string;
            name: string;
            description: string | null;
        };
        recordedBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        amount: number;
        categoryId: string;
        recordedById: string;
    })[]>;
    createCafeExpense(dto: {
        amount: number;
        description: string;
        categoryName: string;
        recordedById: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        amount: number;
        categoryId: string;
        recordedById: string;
    }>;
}
