import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memberStorage } from './multer.config';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

@Controller('members')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  create(
    @Body() createMemberDto: CreateMemberDto,
    @Req() req: RequestWithUser,
  ) {
    return this.membersService.create(createMemberDto, req.user.userId);
  }

  @Get()
  @Roles('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER')
  findAll(@Query() query: any) {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Req() req: RequestWithUser,
  ) {
    return this.membersService.update(id, updateMemberDto, req.user.userId);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.membersService.remove(id, req.user.userId);
  }

  @Get(':id/timeline')
  @Roles('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER')
  getTimeline(@Param('id') id: string) {
    return this.membersService.getTimeline(id);
  }

  // --- Documents Endpoints ---
  @Post(':id/documents')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  @UseInterceptors(FileInterceptor('file', { storage: memberStorage }))
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ) {
    if (!file) throw new BadRequestException('File is required');

    return this.membersService.addDocument(id, {
      type: body.type,
      title: body.title,
      fileUrl: `/uploads/members/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedById: req.user.userId,
    });
  }

  @Delete(':id/documents/:docId')
  @Roles('OWNER', 'MANAGER')
  deleteDocument(@Param('id') id: string, @Param('docId') docId: string) {
    return this.membersService.deleteDocument(id, docId);
  }

  // --- Notes Endpoints ---
  @Get(':id/notes')
  @Roles('OWNER', 'MANAGER', 'TRAINER')
  getNotes(@Param('id') id: string) {
    return this.membersService.getNotes(id);
  }

  @Put(':id/access-card')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  async issueAccessCard(
    @Param('id') id: string,
    @Body('accessCardId') accessCardId: string,
  ) {
    return this.membersService.issueAccessCard(id, accessCardId);
  }

  @Post(':id/notes')
  @Roles('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER')
  addNote(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ) {
    return this.membersService.addNote(id, {
      ...body,
      authorId: req.user.userId,
    });
  }

  @Delete(':id/notes/:noteId')
  @Roles('OWNER', 'MANAGER')
  deleteNote(@Param('id') id: string, @Param('noteId') noteId: string) {
    return this.membersService.deleteNote(id, noteId);
  }

  // --- Measurements Endpoints ---
  @Get(':id/measurements')
  @Roles('OWNER', 'MANAGER', 'TRAINER')
  getMeasurements(@Param('id') id: string) {
    return this.membersService.getMeasurements(id);
  }

  @Post(':id/measurements')
  @Roles('OWNER', 'MANAGER', 'TRAINER')
  addMeasurement(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.membersService.addMeasurement(id, body);
  }

  // --- Subscriptions & Billing ---
  @Put(':id/subscriptions/:subId/freeze')
  @Roles('OWNER', 'MANAGER')
  freezeSubscription(
    @Param('id') id: string,
    @Param('subId') subId: string,
    @Body('frozenUntil') frozenUntil: string,
  ) {
    return this.membersService.freezeSubscription(id, subId, new Date(frozenUntil));
  }

  @Put(':id/subscriptions/:subId/transfer')
  @Roles('OWNER', 'MANAGER')
  transferSubscription(
    @Param('id') id: string,
    @Param('subId') subId: string,
    @Body('targetMemberId') targetMemberId: string,
  ) {
    return this.membersService.transferSubscription(id, subId, targetMemberId);
  }

  @Put(':id/subscriptions/:subId/agreement')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  updateAgreement(
    @Param('id') id: string,
    @Param('subId') subId: string,
    @Body('agreementUrl') agreementUrl: string,
  ) {
    return this.membersService.updateSubscriptionAgreement(id, subId, agreementUrl);
  }

  @Get(':id/invoices')
  @Roles('OWNER', 'MANAGER', 'RECEPTION')
  getInvoices(@Param('id') id: string) {
    return this.membersService.getInvoices(id);
  }

  // --- Attendance ---
  @Get(':id/attendance')
  @Roles('OWNER', 'MANAGER', 'RECEPTION', 'TRAINER')
  getAttendance(@Param('id') id: string) {
    return this.membersService.getAttendance(id);
  }
}
