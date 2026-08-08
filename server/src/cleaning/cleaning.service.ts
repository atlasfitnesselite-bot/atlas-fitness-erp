import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleaningService {
  constructor(private prisma: PrismaService) {}

  async getAreas() {
    return this.prisma.cleaningArea.findMany({
      include: {
        checklists: {
          take: 5,
          orderBy: { date: 'desc' },
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createArea(data: { name: string; description?: string }) {
    return this.prisma.cleaningArea.create({ data });
  }

  async getChecklists(filters: { date?: string; areaId?: string; status?: string; assignedTo?: string }) {
    const where: any = {};
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }
    if (filters.areaId) where.areaId = filters.areaId;
    if (filters.status) where.status = filters.status;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    return this.prisma.cleaningChecklist.findMany({
      where,
      include: {
        area: true,
        assignee: {
          select: { id: true, firstName: true, lastName: true }
        },
        tasks: true
      },
      orderBy: { date: 'desc' }
    });
  }

  async createChecklist(data: { areaId: string; date: string; shift: string; assignedTo?: string; tasks: string[] }) {
    return this.prisma.cleaningChecklist.create({
      data: {
        areaId: data.areaId,
        date: new Date(data.date),
        shift: data.shift,
        assignedTo: data.assignedTo,
        tasks: {
          create: data.tasks.map(taskName => ({ taskName }))
        }
      },
      include: {
        area: true,
        tasks: true,
        assignee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async updateChecklistStatus(id: string, data: { status: string; verifiedBy?: string }) {
    return this.prisma.cleaningChecklist.update({
      where: { id },
      data: {
        status: data.status,
        verifiedBy: data.verifiedBy
      },
      include: {
        area: true,
        tasks: true
      }
    });
  }

  async updateTask(id: string, data: { isCompleted?: boolean; photoProof?: string; remarks?: string }) {
    const currentTask = await this.prisma.cleaningTask.findUnique({ where: { id } });
    if (!currentTask) throw new NotFoundException('Task not found');

    const updateData: any = { ...data };
    if (data.isCompleted === true && !currentTask.isCompleted) {
      updateData.completedAt = new Date();
    } else if (data.isCompleted === false && currentTask.isCompleted) {
      updateData.completedAt = null;
    }

    const task = await this.prisma.cleaningTask.update({
      where: { id },
      data: updateData
    });

    // Check if all tasks in checklist are completed
    const allTasks = await this.prisma.cleaningTask.findMany({
      where: { checklistId: task.checklistId }
    });

    const allCompleted = allTasks.every(t => t.isCompleted);
    if (allCompleted) {
      await this.prisma.cleaningChecklist.update({
        where: { id: task.checklistId },
        data: { status: 'COMPLETED' }
      });
    } else {
      await this.prisma.cleaningChecklist.update({
        where: { id: task.checklistId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return task;
  }
}
