import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Roles('OWNER', 'MANAGER')
  @Post('plans')
  createPlan(@Body() createMembershipPlanDto: CreateMembershipPlanDto) {
    return this.subscriptionsService.createPlan(createMembershipPlanDto);
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('plans/:id')
  getPlanById(@Param('id') id: string) {
    return this.subscriptionsService.getPlanById(id);
  }

  @Roles('OWNER', 'MANAGER')
  @Put('plans/:id')
  updatePlan(@Param('id') id: string, @Body() updateDto: Partial<CreateMembershipPlanDto>) {
    return this.subscriptionsService.updatePlan(id, updateDto);
  }

  @Roles('OWNER', 'MANAGER')
  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(id);
  }

  @Roles('OWNER', 'MANAGER')
  @Post('assign')
  assignPlan(@Body() assignPlanDto: AssignPlanDto) {
    return this.subscriptionsService.assignPlan(assignPlanDto);
  }

  @Get()
  getSubscriptions() {
    return this.subscriptionsService.getSubscriptions();
  }
}
