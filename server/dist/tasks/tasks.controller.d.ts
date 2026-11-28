import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    getMyTasks(req: {
        user?: {
            id?: string;
        };
    }): Promise<({
        assignee: {
            id: string;
            employeeId: string;
            userId: string | null;
            firstName: string;
            lastName: string;
        } | null;
        assigner: {
            id: string;
            email: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    })[]>;
    getTasks(status?: string, priority?: string, assignedTo?: string, category?: string): Promise<({
        assignee: {
            id: string;
            employeeId: string;
            userId: string | null;
            firstName: string;
            lastName: string;
        } | null;
        assigner: {
            id: string;
            email: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    })[]>;
    createTask(data: any, req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
    updateTask(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
    completeTask(id: string, data: {
        remarks?: string;
    }, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
    deleteTask(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        category: string;
        title: string;
        completedAt: Date | null;
        photoProof: string | null;
        remarks: string | null;
        assignedTo: string | null;
        priority: string;
        dueDate: Date | null;
        assignedBy: string | null;
    }>;
}
