import { VisitorService } from './visitor.service';
export declare class VisitorController {
    private readonly visitorService;
    constructor(visitorService: VisitorService);
    create(createVisitorDto: any, req: any): import("@prisma/client").Prisma.Prisma__VisitorEntryClient<{
        id: string;
        name: string;
        checkIn: Date;
        checkOut: Date | null;
        phone: string;
        purpose: string | null;
        handledBy: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        checkIn: Date;
        checkOut: Date | null;
        phone: string;
        purpose: string | null;
        handledBy: string | null;
    }[]>;
    findToday(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        checkIn: Date;
        checkOut: Date | null;
        phone: string;
        purpose: string | null;
        handledBy: string | null;
    }[]>;
    checkout(id: string): import("@prisma/client").Prisma.Prisma__VisitorEntryClient<{
        id: string;
        name: string;
        checkIn: Date;
        checkOut: Date | null;
        phone: string;
        purpose: string | null;
        handledBy: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
