import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getRooms(userId: string): Promise<({
        participants: {
            id: string;
            userId: string;
            roomId: string;
            joinedAt: Date;
        }[];
        messages: {
            id: string;
            createdAt: Date;
            type: string;
            content: string;
            roomId: string;
            senderId: string;
            readBy: string;
        }[];
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
    })[]>;
    isParticipant(roomId: string, userId: string): Promise<boolean>;
    getMessages(roomId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        content: string;
        roomId: string;
        senderId: string;
        readBy: string;
    }[]>;
    createRoom(type: string, participantIds: string[], name?: string): Promise<{
        participants: {
            id: string;
            userId: string;
            roomId: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
    }>;
    sendMessage(roomId: string, senderId: string, content: string, type: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        content: string;
        roomId: string;
        senderId: string;
        readBy: string;
    }>;
    markAsRead(roomId: string, userId: string): Promise<{
        success: boolean;
    }>;
    createTaskFromChat(roomId: string, userId: string, taskData: any): Promise<{
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
