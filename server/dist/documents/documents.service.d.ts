import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllDocuments(userId: string, role: string): Promise<{
        companyDocs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            title: string;
            uploadedBy: string | null;
        }[];
        employeeDocs: ({
            employee: {
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
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            category: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            version: number;
        })[];
        memberDocs: ({
            member: {
                id: string;
                email: string | null;
                createdAt: Date;
                updatedAt: Date;
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
                status: string;
                branch: string | null;
                gstNumber: string | null;
                aadhaarNumber: string | null;
                panNumber: string | null;
                memberId: string;
                accessCardId: string | null;
                occupation: string | null;
                altMobile: string | null;
                passportNumber: string | null;
                height: string | null;
                weight: string | null;
                workoutType: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            category: string;
            fileUrl: string;
            fileSize: number | null;
            mimeType: string | null;
            title: string;
            memberId: string;
            uploadedById: string | null;
        })[];
    } | {
        companyDocs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            title: string;
            uploadedBy: string | null;
        }[];
        employeeDocs: any[];
        memberDocs: never[];
    }>;
    uploadDocument(file: Express.Multer.File, userId: string, data: {
        type: 'COMPANY' | 'EMPLOYEE' | 'MEMBER';
        ownerId?: string;
        title: string;
        category: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        category: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        version: number;
    } | {
        id: string;
        createdAt: Date;
        type: string;
        category: string;
        fileUrl: string;
        fileSize: number | null;
        mimeType: string | null;
        title: string;
        memberId: string;
        uploadedById: string | null;
    } | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        title: string;
        uploadedBy: string | null;
    }>;
    deleteDocument(id: string, type: 'COMPANY' | 'EMPLOYEE' | 'MEMBER'): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        category: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        version: number;
    } | {
        id: string;
        createdAt: Date;
        type: string;
        category: string;
        fileUrl: string;
        fileSize: number | null;
        mimeType: string | null;
        title: string;
        memberId: string;
        uploadedById: string | null;
    } | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        title: string;
        uploadedBy: string | null;
    }>;
}
