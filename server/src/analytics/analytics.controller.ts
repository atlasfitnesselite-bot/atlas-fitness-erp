import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles('OWNER', 'MANAGER')
  @Get('dashboard')
  async getDashboardStats(@Req() req: { user: { id: string; email: string; roles: string[] } }) {
    return this.analyticsService.getDashboardStats();
  }

  @Roles('OWNER', 'MANAGER')
  @Get('manager-dashboard')
  async getManagerDashboardStats() {
    return this.analyticsService.getManagerDashboardStats();
  }

  @Get('trainer-dashboard')
  async getTrainerDashboardStats(@Req() req: any) {
    return this.analyticsService.getTrainerDashboardStats(req.user.id);
  }

  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @Get('reception-dashboard')
  async getReceptionDashboardStats() {
    return this.analyticsService.getReceptionDashboardStats();
  }

  @Roles('OWNER', 'MANAGER')
  @Get('business-intelligence')
  async getBusinessIntelligenceData(@Req() req: any) {
    const roles = req.user?.roles || [];
    const role = roles.includes('OWNER') ? 'OWNER' : 'MANAGER';
    return this.analyticsService.getBusinessIntelligenceData(role);
  }

  // Allow members to submit feedback (or Reception on their behalf)
  @Post('feedback')
  async submitFeedback(@Body() body: { memberId: string, category: string, rating: number, comments: string }) {
    // Ideally this goes into a separate module, but since it's feeding Analytics directly:
    return this.analyticsService['prisma'].memberFeedback.create({
      data: {
        memberId: body.memberId,
        category: body.category || 'GENERAL',
        rating: body.rating,
        comments: body.comments
      }
    });
  }
}
