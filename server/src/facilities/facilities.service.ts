import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Maintenance ---
  async getMaintenanceTickets() {
    return this.prisma.maintenanceTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createMaintenanceTicket(data: { equipment: string, issue: string, priority: string, reportedBy: string }) {
    return this.prisma.maintenanceTicket.create({
      data: {
        ...data,
        status: 'PENDING'
      }
    });
  }

  async resolveMaintenanceTicket(id: string) {
    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() }
    });
  }

  // --- Cleaning (Deprecated, moved to CleaningModule) ---
  async getCleaningZones() {
    throw new Error('This method is deprecated. Please use the Cleaning module endpoints instead.');
  }

  async createCleaningZone(data: { name: string, shift: string, tasks: { name: string }[] }) {
    throw new Error('This method is deprecated. Please use the Cleaning module endpoints instead.');
  }

  async toggleCleaningTask(id: string, isCompleted: boolean) {
    throw new Error('This method is deprecated. Please use the Cleaning module endpoints instead.');
  }
}
