import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { DocumentsService } from './documents.service';
import { documentStorage } from './multer.config';

@Controller('documents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async getAllDocuments(@Request() req: any) {
    return this.documentsService.getAllDocuments(req.user.userId, req.user.role);
  }

  @Post('upload')
  @Roles('OWNER', 'MANAGER', 'ADMIN')
  @UseInterceptors(FileInterceptor('file', { storage: documentStorage }))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    return this.documentsService.uploadDocument(file, req.user.userId, {
      type: body.type,
      ownerId: body.ownerId,
      title: body.title,
      category: body.category,
      description: body.description
    });
  }

  @Delete(':type/:id')
  @Roles('OWNER', 'MANAGER', 'ADMIN')
  async deleteDocument(@Param('type') type: 'COMPANY' | 'EMPLOYEE' | 'MEMBER', @Param('id') id: string) {
    return this.documentsService.deleteDocument(id, type);
  }
}
