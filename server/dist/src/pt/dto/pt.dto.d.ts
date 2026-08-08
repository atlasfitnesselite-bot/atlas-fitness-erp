export declare enum FitnessPlanType {
    WORKOUT = "WORKOUT",
    DIET = "DIET"
}
export declare class BookSessionDto {
    trainerId: string;
    memberId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}
export declare class CreateFitnessPlanDto {
    memberId: string;
    trainerId: string;
    type: FitnessPlanType;
    title: string;
    content: Record<string, any>;
}
export declare class CreateMeasurementDto {
    chest?: number;
    waist?: number;
    hip?: number;
    biceps?: number;
    thigh?: number;
    calf?: number;
    neck?: number;
    forearm?: number;
}
export declare class CreateCommissionDto {
    trainerId: string;
    sourceId: string;
    amount: number;
}
export declare class CompleteSessionDto {
    duration?: number;
    exercisesCompleted?: string;
    intensity?: string;
    clientFeedback?: string;
    signatureUrl?: string;
}
