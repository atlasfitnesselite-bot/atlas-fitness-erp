import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async getEquipment(filters: { category?: string; status?: string; location?: string }) {
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.location) where.location = filters.location;

    return this.prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEquipment(data: any) {
    const count = await this.prisma.equipment.count();
    const equipmentCode = `EQ-${(count + 1).toString().padStart(4, '0')}`;
    return this.prisma.equipment.create({ 
      data: {
        ...data,
        equipmentId: data.equipmentId || equipmentCode,
      } 
    });
  }

  async updateEquipment(id: string, data: any) {
    return this.prisma.equipment.update({
      where: { id },
      data,
    });
  }

  async getFaultReports(equipmentId: string) {
    return this.prisma.faultReport.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reportFault(equipmentId: string, data: any, reportedBy?: string) {
    const fault = await this.prisma.faultReport.create({
      data: {
        ...data,
        equipmentId,
        reportedBy: reportedBy || 'UNKNOWN',
      },
    });

    const equipment = await this.prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (equipment) {
      this.notificationsService.broadcastToRole({
        title: 'Equipment Fault',
        message: `${equipment.name} (${equipment.model}) has been reported faulty.`,
        type: 'DANGER',
        targetRole: 'MANAGER',
      }).catch(console.error);
    }

    return fault;
  }

  async resolveFault(faultId: string, technicianNotes?: string) {
    const fault = await this.prisma.faultReport.findUnique({ where: { id: faultId } });
    if (!fault) throw new NotFoundException('Fault report not found');

    await this.prisma.equipment.update({
      where: { id: fault.equipmentId },
      data: { status: 'ACTIVE' },
    });

    return this.prisma.faultReport.update({
      where: { id: faultId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        technicianNotes,
      },
    });
  }
}
