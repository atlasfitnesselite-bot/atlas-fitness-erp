import { PrismaService } from '../prisma/prisma.service';
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    createClass(data: any): import("@prisma/client").Prisma.Prisma__GroupClassClient<{
        id: string;
        name: string;
        status: string;
        date: Date;
        startTime: string;
        endTime: string;
        instructorId: string;
        capacity: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findToday(): Promise<({
        _count: {
            bookings: number;
        };
        instructor: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            userId: string | null;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            gender: string | null;
            dateOfBirth: Date | null;
            bloodGroup: string | null;
            maritalStatus: string | null;
            nationality: string | null;
            mobile: string | null;
            departmentId: string | null;
            designationId: string | null;
            employmentTypeId: string | null;
            joiningDate: Date;
            probationEnd: Date | null;
            confirmationDate: Date | null;
            managerId: string | null;
            workLocation: string | null;
            status: string;
            hashedPin: string | null;
        };
    } & {
        id: string;
        name: string;
        status: string;
        date: Date;
        startTime: string;
        endTime: string;
        instructorId: string;
        capacity: number;
    })[]>;
    bookClass(classId: string, memberId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        memberId: string;
        classId: string;
    }>;
}
