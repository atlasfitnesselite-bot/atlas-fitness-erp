import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async isParticipant(roomId: string, userId: string): Promise<boolean> {
    if (!roomId || !userId) return false;
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    return Boolean(participant);
  }

  async getMessages(roomId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } }
    });
    if (!participant) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    return this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async createRoom(type: string, participantIds: string[], name?: string) {
    if (type === 'DIRECT' && participantIds.length === 2) {
      const existingRooms = await this.prisma.chatRoom.findMany({
        where: { type: 'DIRECT' },
        include: { participants: true }
      });
      const room = existingRooms.find(r => 
        r.participants.length === 2 && 
        r.participants.every(p => participantIds.includes(p.userId))
      );
      if (room) return room;
    }

    return this.prisma.chatRoom.create({
      data: {
        type,
        name,
        participants: {
          create: participantIds.map(userId => ({ userId }))
        }
      },
      include: { participants: true, messages: true }
    });
  }

  async sendMessage(roomId: string, senderId: string, content: string, type: string) {
    return this.prisma.chatMessage.create({
      data: {
        roomId,
        senderId,
        content,
        type,
        readBy: JSON.stringify([senderId])
      }
    });
  }

  async markAsRead(roomId: string, userId: string) {
    // Find unread messages
    const unreadMessages = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        NOT: { readBy: { contains: userId } },
      },
    });

    // Update each message (SQLite workaround for JSON array append)
    for (const msg of unreadMessages) {
      let readByArray = [];
      try {
        readByArray = JSON.parse(msg.readBy);
      } catch (e) {
        readByArray = [];
      }
      if (!readByArray.includes(userId)) {
        readByArray.push(userId);
      }
      await this.prisma.chatMessage.update({
        where: { id: msg.id },
        data: { readBy: JSON.stringify(readByArray) },
      });
    }

    return { success: true };
  }

  async createTaskFromChat(roomId: string, userId: string, taskData: any) {
    const { assigneeId, dueDate, ...rest } = taskData;

    let assignedToEmpId = undefined;
    if (assigneeId) {
      const emp = await this.prisma.employee.findUnique({ where: { userId: assigneeId } });
      if (emp) assignedToEmpId = emp.id;
    }

    const task = await this.prisma.task.create({
      data: {
        ...rest,
        assignedTo: assignedToEmpId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedBy: userId,
      },
    });

    return task;
  }
}
