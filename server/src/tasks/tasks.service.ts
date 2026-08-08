import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeByUserId(userId: string) {
    return this.prisma.employee.findUnique({
      where: { userId }
    });
  }

  async getTasks(filters: { status?: string; priority?: string; assignedTo?: string; category?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.category) where.category = filters.category;

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, userId: true, firstName: true, lastName: true, employeeId: true } },
        assigner: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async createTask(data: any, userId?: string) {
    const payload = { ...data, assignedBy: userId };
    
    if (!payload.assignedTo) delete payload.assignedTo;
    if (!payload.description) delete payload.description;
    
    if (payload.dueDate) {
      payload.dueDate = new Date(payload.dueDate);
    } else {
      delete payload.dueDate;
    }

    return this.prisma.task.create({
      data: payload,
    });
  }

  async updateTask(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.status === 'COMPLETED' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }
    return this.prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async completeTask(id: string, data: { photoProof?: string; remarks?: string }) {
    return this.prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        photoProof: data.photoProof,
        remarks: data.remarks,
      },
    });
  }

  async deleteTask(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
