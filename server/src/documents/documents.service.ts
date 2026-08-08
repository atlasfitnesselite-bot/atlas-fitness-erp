import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async getAllDocuments(userId: string, role: string) {
    if (role === 'OWNER' || role === 'MANAGER' || role === 'ADMIN') {
      const companyDocs = await this.prisma.companyDocument.findMany({
        orderBy: { createdAt: 'desc' }
      });
      const employeeDocs = await this.prisma.employeeDocument.findMany({
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
      });
      const memberDocs = await this.prisma.memberDocument.findMany({
        include: { member: true },
        orderBy: { createdAt: 'desc' }
      });
      
      return { companyDocs, employeeDocs, memberDocs };
    } else {
      // Find employee
      const employee = await this.prisma.employee.findFirst({
        where: { userId }
      });
      
      const companyDocs = await this.prisma.companyDocument.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      let employeeDocs: any[] = [];
      if (employee) {
        employeeDocs = await this.prisma.employeeDocument.findMany({
          where: { employeeId: employee.id },
          include: { employee: true },
          orderBy: { createdAt: 'desc' }
        });
      }
      
      return { companyDocs, employeeDocs, memberDocs: [] };
    }
  }

  async uploadDocument(
    file: Express.Multer.File, 
    userId: string,
    data: { 
      type: 'COMPANY' | 'EMPLOYEE' | 'MEMBER', 
      ownerId?: string, 
      title: string, 
      category: string,
      description?: string
    }
  ) {
    const fileUrl = `/uploads/documents/${file.filename}`;
    const fileSize = file.size;
    const mimeType = file.mimetype;

    if (data.type === 'COMPANY') {
      return this.prisma.companyDocument.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          fileName: file.originalname,
          fileUrl,
          fileSize,
          mimeType,
          uploadedBy: userId
        }
      });
    } else if (data.type === 'EMPLOYEE') {
      if (!data.ownerId) throw new BadRequestException('Employee ID is required');
      return this.prisma.employeeDocument.create({
        data: {
          employeeId: data.ownerId,
          name: data.title,
          category: data.category,
          fileName: file.originalname,
          fileUrl,
          fileSize,
          mimeType
        }
      });
    } else if (data.type === 'MEMBER') {
      if (!data.ownerId) throw new BadRequestException('Member ID is required');
      return this.prisma.memberDocument.create({
        data: {
          memberId: data.ownerId,
          title: data.title,
          type: 'DOCUMENT',
          category: data.category,
          fileUrl,
          fileSize,
          mimeType,
          uploadedById: userId
        }
      });
    }
    
    throw new BadRequestException('Invalid document type');
  }

  async deleteDocument(id: string, type: 'COMPANY' | 'EMPLOYEE' | 'MEMBER') {
    if (type === 'COMPANY') {
      return this.prisma.companyDocument.delete({ where: { id } });
    } else if (type === 'EMPLOYEE') {
      return this.prisma.employeeDocument.delete({ where: { id } });
    } else if (type === 'MEMBER') {
      return this.prisma.memberDocument.delete({ where: { id } });
    }
    throw new BadRequestException('Invalid document type');
  }
}
