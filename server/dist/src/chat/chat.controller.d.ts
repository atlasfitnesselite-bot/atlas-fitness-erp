import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getRooms(req: any): Promise<({
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
    getMessages(roomId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        content: string;
        roomId: string;
        senderId: string;
        readBy: string;
    }[]>;
    createRoom(body: {
        type: string;
        participantIds: string[];
        name?: string;
    }, req: any): Promise<{
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
    sendMessage(roomId: string, body: {
        content: string;
        type?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        content: string;
        roomId: string;
        senderId: string;
        readBy: string;
    }>;
    markAsRead(roomId: string, req: any): Promise<{
        success: boolean;
    }>;
    createTaskFromChat(roomId: string, taskData: any, req: any): Promise<{
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
