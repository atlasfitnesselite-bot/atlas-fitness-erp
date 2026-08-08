import { PtService } from './pt.service';
import { BookSessionDto, CreateFitnessPlanDto, CreateMeasurementDto, CreateCommissionDto, CompleteSessionDto } from './dto/pt.dto';
export declare class PtController {
    private readonly ptService;
    constructor(ptService: PtService);
    getSessions(): Promise<({
        member: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            mobile: string;
        };
        trainer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            mobile: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number | null;
        memberId: string;
        trainerId: string;
        exercisesCompleted: string | null;
        intensity: string | null;
        clientFeedback: string | null;
        signatureUrl: string | null;
    })[]>;
    createSession(dto: BookSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number | null;
        memberId: string;
        trainerId: string;
        exercisesCompleted: string | null;
        intensity: string | null;
        clientFeedback: string | null;
        signatureUrl: string | null;
    }>;
    bookSession(dto: BookSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number | null;
        memberId: string;
        trainerId: string;
        exercisesCompleted: string | null;
        intensity: string | null;
        clientFeedback: string | null;
        signatureUrl: string | null;
    }>;
    getFitnessPlans(memberId?: string): Promise<({
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
        };
        trainer: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            userId: string | null;
            employeeId: string;
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
            hashedPin: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        title: string;
        memberId: string;
        trainerId: string;
    })[]>;
    createFitnessPlan(dto: CreateFitnessPlanDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        title: string;
        memberId: string;
        trainerId: string;
    }>;
    updateFitnessPlan(id: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        title: string;
        memberId: string;
        trainerId: string;
    }>;
    deleteFitnessPlan(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        title: string;
        memberId: string;
        trainerId: string;
    }>;
    updateSessionStatus(id: string, status: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number | null;
        memberId: string;
        trainerId: string;
        exercisesCompleted: string | null;
        intensity: string | null;
        clientFeedback: string | null;
        signatureUrl: string | null;
    }>;
    completeSession(sessionId: string, dto: CompleteSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number | null;
        memberId: string;
        trainerId: string;
        exercisesCompleted: string | null;
        intensity: string | null;
        clientFeedback: string | null;
        signatureUrl: string | null;
    }>;
    updateSessionNotes(id: string, notes: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number | null;
        memberId: string;
        trainerId: string;
        exercisesCompleted: string | null;
        intensity: string | null;
        clientFeedback: string | null;
        signatureUrl: string | null;
    }>;
    updateSessionFeedback(id: string, clientFeedback: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number | null;
        memberId: string;
        trainerId: string;
        exercisesCompleted: string | null;
        intensity: string | null;
        clientFeedback: string | null;
        signatureUrl: string | null;
    }>;
    getTrainerStats(req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        completedSessions: number;
        cancelledSessions: number;
        upcomingSessions: number;
        totalClients: number;
        totalEarnings: number;
        performanceScore: number;
        sessionsThisMonth: number;
    }>;
    getTrainerDashboard(req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        completedSessions: number;
        missedSessions: number;
        revenueGenerated: number;
        commissionEarned: number;
    }>;
    getMemberProfile(memberId: string): Promise<{
        member: {
            fitnessAssessment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                memberId: string;
                fitnessGoal: string | null;
                bodyFatPercentage: number | null;
                muscleMass: number | null;
                visceralFat: number | null;
                bmr: number | null;
                tdee: number | null;
            } | null;
        } & {
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
        };
        ptPackages: ({
            trainer: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                userId: string | null;
                employeeId: string;
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
                hashedPin: string | null;
            } | null;
            package: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                numberOfSessions: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            startDate: Date;
            memberId: string;
            trainerId: string | null;
            packageId: string;
            sessionsTotal: number;
            sessionsRemaining: number;
            expiryDate: Date;
        })[];
        fitnessPlans: ({
            trainer: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                userId: string | null;
                employeeId: string;
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
                hashedPin: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string;
            title: string;
            memberId: string;
            trainerId: string;
        })[];
        measurements: {
            id: string;
            date: Date;
            memberId: string;
            chest: number | null;
            waist: number | null;
            hip: number | null;
            neck: number | null;
            biceps: number | null;
            forearm: number | null;
            thigh: number | null;
            calf: number | null;
        }[];
        fitnessAssessment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            memberId: string;
            fitnessGoal: string | null;
            bodyFatPercentage: number | null;
            muscleMass: number | null;
            visceralFat: number | null;
            bmr: number | null;
            tdee: number | null;
        } | null;
        progressPhotos: {
            id: string;
            date: Date;
            memberId: string;
            photoUrl: string;
        }[];
        ptSessions: ({
            trainer: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                userId: string | null;
                employeeId: string;
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
                hashedPin: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            date: Date;
            startTime: string;
            endTime: string;
            duration: number | null;
            memberId: string;
            trainerId: string;
            exercisesCompleted: string | null;
            intensity: string | null;
            clientFeedback: string | null;
            signatureUrl: string | null;
        })[];
    }>;
    getMemberProgress(memberId: string): Promise<{
        latestAssessment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            memberId: string;
            fitnessGoal: string | null;
            bodyFatPercentage: number | null;
            muscleMass: number | null;
            visceralFat: number | null;
            bmr: number | null;
            tdee: number | null;
        } | null;
        measurements: {
            id: string;
            date: Date;
            memberId: string;
            chest: number | null;
            waist: number | null;
            hip: number | null;
            neck: number | null;
            biceps: number | null;
            forearm: number | null;
            thigh: number | null;
            calf: number | null;
        }[];
        sessionHistory: ({
            trainer: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            date: Date;
            startTime: string;
            endTime: string;
            duration: number | null;
            memberId: string;
            trainerId: string;
            exercisesCompleted: string | null;
            intensity: string | null;
            clientFeedback: string | null;
            signatureUrl: string | null;
        })[];
        activePlans: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string;
            title: string;
            memberId: string;
            trainerId: string;
        }[];
        progressPhotos: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            type: string;
            date: Date;
            memberId: string;
            trainerId: string | null;
            photoUrl: string;
        }[];
    }>;
    addMeasurement(memberId: string, dto: CreateMeasurementDto): Promise<{
        id: string;
        date: Date;
        memberId: string;
        chest: number | null;
        waist: number | null;
        hip: number | null;
        neck: number | null;
        biceps: number | null;
        forearm: number | null;
        thigh: number | null;
        calf: number | null;
    }>;
    uploadProgressPhoto(memberId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: string;
        date: Date;
        memberId: string;
        trainerId: string | null;
        photoUrl: string;
    }>;
    getMyCommission(req: any): Promise<{
        commissions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            year: number | null;
            month: number | null;
            trainerId: string;
            amount: number;
            sourceId: string;
        }[];
        summary: {
            totalEarned: number;
            totalPending: number;
            totalPaid: number;
        };
    }>;
    getCommission(trainerId: string): Promise<{
        commissions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            year: number | null;
            month: number | null;
            trainerId: string;
            amount: number;
            sourceId: string;
        }[];
        summary: {
            totalEarned: number;
            totalPending: number;
            totalPaid: number;
        };
    }>;
    createCommission(dto: CreateCommissionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        year: number | null;
        month: number | null;
        trainerId: string;
        amount: number;
        sourceId: string;
    }>;
    getLeaderboard(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        completedSessionsThisMonth: number;
        revenueGenerated: number;
        clientCount: number;
    }[]>;
}
