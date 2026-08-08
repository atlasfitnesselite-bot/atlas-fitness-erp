import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Membership Plans
  async createPlan(data: CreateMembershipPlanDto) {
    return this.prisma.membershipPlan.create({ data });
  }

  async getPlans() {
    return this.prisma.membershipPlan.findMany();
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async updatePlan(id: string, data: Partial<CreateMembershipPlanDto>) {
    return this.prisma.membershipPlan.update({
      where: { id },
      data,
    });
  }

  async deletePlan(id: string) {
    return this.prisma.membershipPlan.delete({ where: { id } });
  }

  // Member Subscriptions
  async assignPlan(data: AssignPlanDto) {
    return this.prisma.memberSubscription.create({
      data: {
        memberId: data.memberId,
        planId: data.planId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
      },
    });
  }

  async getSubscriptions() {
    return this.prisma.memberSubscription.findMany({
      include: {
        member: true,
        plan: true,
      },
    });
  }
}
