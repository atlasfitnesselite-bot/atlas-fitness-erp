import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req, UnauthorizedException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { PtService } from './pt.service';
import { BookSessionDto, CreateFitnessPlanDto, CreateMeasurementDto, CreateCommissionDto, CompleteSessionDto } from './dto/pt.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('pt')
export class PtController {
  constructor(private readonly ptService: PtService) {}

  @Roles('OWNER', 'MANAGER', 'TRAINER', 'FRONT_DESK')
  @Get('sessions')
  async getSessions() {
    return this.ptService.getSessions();
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER', 'FRONT_DESK')
  @Post('sessions')
  async createSession(@Body() dto: BookSessionDto) {
    return this.ptService.bookSession(dto);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER', 'FRONT_DESK')
  @Post('sessions/book')
  async bookSession(@Body() dto: BookSessionDto) {
    return this.ptService.bookSession(dto);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Get('fitness-plans')
  async getFitnessPlans(@Query('memberId') memberId?: string) {
    return this.ptService.getFitnessPlans(memberId);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Post('fitness-plans')
  async createFitnessPlan(@Body() dto: CreateFitnessPlanDto) {
    return this.ptService.createFitnessPlan(dto);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Put('fitness-plans/:id')
  async updateFitnessPlan(@Param('id') id: string, @Body() dto: any) {
    return this.ptService.updateFitnessPlan(id, dto);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Delete('fitness-plans/:id')
  async deleteFitnessPlan(@Param('id') id: string) {
    return this.ptService.deleteFitnessPlan(id);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Put('sessions/:id/status')
  async updateSessionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return this.ptService.updateSessionStatus(id, status, notes);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Put('sessions/:sessionId/complete')
  async completeSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: CompleteSessionDto
  ) {
    return this.ptService.completeSession(sessionId, dto);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Put('sessions/:id/notes') // Note: Using Put for compatibility, but acts as Patch
  async updateSessionNotes(
    @Param('id') id: string,
    @Body('notes') notes: string,
  ) {
    return this.ptService.updateSessionNotes(id, notes);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Put('sessions/:id/feedback')
  async updateSessionFeedback(
    @Param('id') id: string,
    @Body('clientFeedback') clientFeedback: string,
  ) {
    return this.ptService.updateSessionFeedback(id, clientFeedback);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TRAINER')
  @Get('trainer/stats')
  async getTrainerStats(@Req() req: { user?: { id?: string } }) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.ptService.getTrainerStats(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TRAINER', 'MANAGER', 'OWNER')
  @Get('trainer/dashboard')
  async getTrainerDashboard(@Req() req: { user?: { id?: string } }) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.ptService.getTrainerDashboard(req.user.id);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Get('members/:memberId/profile')
  async getMemberProfile(@Param('memberId') memberId: string) {
    return this.ptService.getMemberProfile(memberId);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Get('members/:memberId/progress')
  async getMemberProgress(@Param('memberId') memberId: string) {
    return this.ptService.getMemberProgress(memberId);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Post('members/:memberId/measurements')
  async addMeasurement(
    @Param('memberId') memberId: string,
    @Body() dto: CreateMeasurementDto
  ) {
    return this.ptService.addMeasurement(memberId, dto);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Post('members/:memberId/progress-photos')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/pt',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadProgressPhoto(
    @Param('memberId') memberId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('Photo file is required');
    const photoUrl = `/uploads/pt/${file.filename}`;
    return this.ptService.addProgressPhoto(memberId, photoUrl);
  }

  @Roles('TRAINER')
  @Get('trainer/commission')
  async getMyCommission(@Req() req: any) {
    return this.ptService.getMyCommission(req.user.id);
  }

  @Roles('OWNER', 'MANAGER')
  @Get('commission/:trainerId')
  async getCommission(@Param('trainerId') trainerId: string) {
    return this.ptService.getCommission(trainerId);
  }

  @Roles('OWNER', 'MANAGER')
  @Post('commission')
  async createCommission(@Body() dto: CreateCommissionDto) {
    return this.ptService.createCommission(dto);
  }

  @Roles('OWNER', 'MANAGER', 'TRAINER')
  @Get('leaderboard')
  async getLeaderboard() {
    return this.ptService.getLeaderboard();
  }
}
