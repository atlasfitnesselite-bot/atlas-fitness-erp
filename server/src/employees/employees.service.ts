import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async getEmployees(query: {
    search?: string;
    departmentId?: string;
    designationId?: string;
    employmentTypeId?: string;
    status?: string;
    managerId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: {
      status?: string;
      departmentId?: string;
      designationId?: string;
      employmentTypeId?: string;
      managerId?: string;
      OR?: any[];
    } = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }
    if (query.designationId) {
      where.designationId = query.designationId;
    }
    if (query.employmentTypeId) {
      where.employmentTypeId = query.employmentTypeId;
    }
    if (query.managerId) {
      where.managerId = query.managerId;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { employeeId: { contains: query.search } },
        { email: { contains: query.search } },
        { mobile: { contains: query.search } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [total, items] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        orderBy: { [sortBy]: sortOrder } as any,
        include: {
          department: true,
          designation: true,
          employmentType: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        employmentType: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
        addresses: true,
        emergencyContacts: true,
        salaryInfo: true,
        payrollStructure: true,
        govDocs: true,
        documents: true,
        notes: true,
        timeline: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async createEmployee(data: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({
      where: {
        OR: [{ employeeId: data.employeeId }, { email: data.email }],
      },
    });
    if (existing) {
      if (existing.employeeId === data.employeeId)
        throw new ConflictException('Employee ID already exists');
      if (existing.email === data.email)
        throw new ConflictException('Email already exists');
    }

    let resolvedUserId = data.userId || null;
    if (!resolvedUserId && data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (existingUser) {
        resolvedUserId = existingUser.id;
      } else {
        const roleName = (data.roleName || 'RECEPTION').toUpperCase();
        let role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) {
          role = await this.prisma.role.create({
            data: { name: roleName, description: `${roleName} role` },
          });
        }
        const hashedPassword = await bcrypt.hash(data.password || 'Password123', 10);
        const createdUser = await this.prisma.user.create({
          data: {
            name: `${data.firstName} ${data.lastName || ''}`.trim(),
            email: data.email,
            password: hashedPassword,
            userRoles: { create: { roleId: role.id } },
          },
        });
        resolvedUserId = createdUser.id;
      }
    }

    const hashedPin = await bcrypt.hash(data.pin || '1234', 10);
    const baseSalaryVal = Number(data.baseSalary || data.salaryInfo?.basicSalary || 0);

    const employee = await this.prisma.employee.create({
      data: {
        employeeId: data.employeeId,
        userId: resolvedUserId,
        hashedPin,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.profilePicture || null,
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        bloodGroup: data.bloodGroup || null,
        maritalStatus: data.maritalStatus || null,
        nationality: data.nationality || null,
        mobile: data.mobile || null,
        email: data.email,
        departmentId: data.departmentId || null,
        designationId: data.designationId || null,
        employmentTypeId: data.employmentTypeId || null,
        joiningDate: new Date(data.joiningDate),
        probationEnd: data.probationEnd ? new Date(data.probationEnd) : null,
        confirmationDate: data.confirmationDate
          ? new Date(data.confirmationDate)
          : null,
        managerId: data.managerId || null,
        workLocation: data.workLocation || null,
        status: data.status || 'ACTIVE',
        addresses: {
          create: data.addresses || [],
        },
        emergencyContacts: {
          create: data.emergencyContacts || [],
        },
        salaryInfo: data.salaryInfo
          ? {
              create: {
                structure: data.salaryInfo.structure,
                basicSalary: data.salaryInfo.basicSalary,
                allowances: data.salaryInfo.allowances || 0,
                bankName: data.salaryInfo.bankName || null,
                accountNumber: data.salaryInfo.accountNumber || null,
                ifscCode: data.salaryInfo.ifscCode || null,
                upi: data.salaryInfo.upi || null,
              },
            }
          : undefined,
        govDocs: data.govDocs
          ? {
              create: {
                aadhaarNumber: data.govDocs.aadhaarNumber || null,
                panNumber: data.govDocs.panNumber || null,
                passport: data.govDocs.passport || null,
                drivingLicense: data.govDocs.drivingLicense || null,
              },
            }
          : undefined,
      },
    });

    if (baseSalaryVal > 0) {
      await this.prisma.payrollStructure.upsert({
        where: { employeeId: employee.id },
        update: {
          baseSalary: baseSalaryVal,
          ptCommissionPercentage: Number(data.ptCommissionPercentage || 0),
        },
        create: {
          employeeId: employee.id,
          baseSalary: baseSalaryVal,
          ptCommissionPercentage: Number(data.ptCommissionPercentage || 0),
        },
      });
    }

    await this.prisma.employeeTimeline.create({
      data: {
        employeeId: employee.id,
        event: 'Joined Company',
        description: `Employee profile created for ${employee.firstName} ${employee.lastName} with ID ${employee.employeeId}.`,
      },
    });

    await this.prisma.employeeStatusHistory.create({
      data: {
        employeeId: employee.id,
        newStatus: employee.status,
        reason: 'Initial Employee Onboarding',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'Employee Created',
        resource: 'Employee',
        details: JSON.stringify({
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
        }),
      },
    });

    return employee;
  }

  async updateEmployee(id: string, data: CreateEmployeeDto) {
    const employee = await this.getEmployeeById(id);

    const timelineEvents = [];
    if (data.status && data.status !== employee.status) {
      timelineEvents.push({
        event: 'Status Change',
        description: `Status changed from ${employee.status} to ${data.status}.`,
      });

      await this.prisma.employeeStatusHistory.create({
        data: {
          employeeId: id,
          oldStatus: employee.status,
          newStatus: data.status,
          reason: 'Manager update',
        },
      });
    }

    if (data.departmentId && data.departmentId !== employee.departmentId) {
      timelineEvents.push({
        event: 'Department Change',
        description: 'Department changed.',
      });
    }

    if (data.designationId && data.designationId !== employee.designationId) {
      timelineEvents.push({
        event: 'Designation Change',
        description: 'Designation changed.',
      });
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.profilePicture || null,
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        bloodGroup: data.bloodGroup || null,
        maritalStatus: data.maritalStatus || null,
        nationality: data.nationality || null,
        mobile: data.mobile || null,
        email: data.email,
        departmentId: data.departmentId || null,
        designationId: data.designationId || null,
        employmentTypeId: data.employmentTypeId || null,
        joiningDate: data.joiningDate
          ? new Date(data.joiningDate)
          : employee.joiningDate,
        probationEnd: data.probationEnd ? new Date(data.probationEnd) : null,
        confirmationDate: data.confirmationDate
          ? new Date(data.confirmationDate)
          : null,
        managerId: data.managerId || null,
        workLocation: data.workLocation || null,
        status: data.status || employee.status,
      },
    });

    if (data.salaryInfo) {
      await this.prisma.salaryInformation.upsert({
        where: { employeeId: id },
        create: {
          employeeId: id,
          structure: data.salaryInfo.structure,
          basicSalary: data.salaryInfo.basicSalary,
          allowances: data.salaryInfo.allowances || 0,
          bankName: data.salaryInfo.bankName || null,
          accountNumber: data.salaryInfo.accountNumber || null,
          ifscCode: data.salaryInfo.ifscCode || null,
          upi: data.salaryInfo.upi || null,
        },
        update: {
          structure: data.salaryInfo.structure,
          basicSalary: data.salaryInfo.basicSalary,
          allowances: data.salaryInfo.allowances || 0,
          bankName: data.salaryInfo.bankName || null,
          accountNumber: data.salaryInfo.accountNumber || null,
          ifscCode: data.salaryInfo.ifscCode || null,
          upi: data.salaryInfo.upi || null,
        },
      });
    }

    if (data.govDocs) {
      await this.prisma.governmentDocument.upsert({
        where: { employeeId: id },
        create: {
          employeeId: id,
          aadhaarNumber: data.govDocs.aadhaarNumber || null,
          panNumber: data.govDocs.panNumber || null,
          passport: data.govDocs.passport || null,
          drivingLicense: data.govDocs.drivingLicense || null,
        },
        update: {
          aadhaarNumber: data.govDocs.aadhaarNumber || null,
          panNumber: data.govDocs.panNumber || null,
          passport: data.govDocs.passport || null,
          drivingLicense: data.govDocs.drivingLicense || null,
        },
      });
    }

    if (data.addresses) {
      await this.prisma.employeeAddress.deleteMany({
        where: { employeeId: id },
      });
      await this.prisma.employeeAddress.createMany({
        data: data.addresses.map((a) => ({ ...a, employeeId: id })),
      });
    }

    if (data.emergencyContacts) {
      await this.prisma.emergencyContact.deleteMany({
        where: { employeeId: id },
      });
      await this.prisma.emergencyContact.createMany({
        data: data.emergencyContacts.map((c) => ({ ...c, employeeId: id })),
      });
    }

    for (const t of timelineEvents) {
      await this.prisma.employeeTimeline.create({
        data: {
          employeeId: id,
          event: t.event,
          description: t.description,
        },
      });
    }

    if (timelineEvents.length === 0) {
      await this.prisma.employeeTimeline.create({
        data: {
          employeeId: id,
          event: 'Profile Update',
          description: 'Employee details updated.',
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'Employee Updated',
        resource: 'Employee',
        details: JSON.stringify({ id, employeeId: updatedEmployee.employeeId }),
      },
    });

    return updatedEmployee;
  }

  async deleteEmployee(id: string) {
    const employee = await this.getEmployeeById(id);
    const result = await this.prisma.employee.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'Employee Deleted',
        resource: 'Employee',
        details: JSON.stringify({
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
        }),
      },
    });

    return result;
  }

  async bulkDelete(ids: string[]) {
    return this.prisma.employee.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async bulkUpdateStatus(ids: string[], status: string) {
    return this.prisma.employee.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  async getEmployeeNotes(employeeId: string) {
    return this.prisma.employeeNote.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEmployeeNote(
    employeeId: string,
    authorId: string,
    content: string,
    type: string,
  ) {
    const note = await this.prisma.employeeNote.create({
      data: { employeeId, authorId, content, type },
    });
    await this.prisma.employeeTimeline.create({
      data: {
        employeeId,
        event: 'Notes',
        description: `A new note of type ${type} was added.`,
      },
    });
    return note;
  }

  async getEmployeeDocuments(employeeId: string) {
    return this.prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addEmployeeDocument(
    employeeId: string,
    name: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    mimeType: string,
  ) {
    const doc = await this.prisma.employeeDocument.create({
      data: {
        employeeId,
        name,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
      },
    });

    await this.prisma.employeeTimeline.create({
      data: {
        employeeId,
        event: 'Document Upload',
        description: `Document '${name}' (${fileName}) uploaded successfully.`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'Document Uploaded',
        resource: 'Employee',
        details: JSON.stringify({ employeeId, documentId: doc.id, documentName: name }),
      },
    });

    return doc;
  }

  async deleteEmployeeDocument(employeeId: string, documentId: string) {
    const doc = await this.prisma.employeeDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    await this.prisma.employeeDocument.delete({ where: { id: documentId } });

    await this.prisma.employeeTimeline.create({
      data: {
        employeeId,
        event: 'Document Delete',
        description: `Document '${doc.name}' was deleted.`,
      },
    });

    return { success: true };
  }

  async getOrgStructure() {
    const employees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        employeeId: true,
        managerId: true,
        designation: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
    return employees;
  }

  async getEmployeeAttendance(id: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await this.prisma.attendance.findMany({
      where: {
        employeeId: id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const totalPresent = records.filter(
      (r) => r.status === 'PRESENT' || r.clockIn,
    ).length;
    const totalAbsent = records.filter((r) => r.status === 'ABSENT').length;
    const totalLate = records.filter((r) => r.lateMinutes > 0).length;
    const totalWorkingHours = records.reduce(
      (sum, r) => sum + (r.workingHours || 0),
      0,
    );
    const totalOvertime = records.reduce(
      (sum, r) => sum + (r.overtime || 0),
      0,
    );

    return {
      records,
      summary: {
        totalPresent,
        totalAbsent,
        totalLate,
        totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        totalOvertime: Math.round(totalOvertime * 100) / 100,
        avgWorkingHours:
          totalPresent > 0
            ? Math.round((totalWorkingHours / totalPresent) * 100) / 100
            : 0,
      },
    };
  }

  async getEmployeeLeaveBalance(id: string) {
    return this.prisma.leaveBalance.findMany({
      where: { employeeId: id },
      include: { leaveType: true },
      orderBy: { year: 'desc' },
    });
  }

  async getEmployeeShifts(id: string) {
    const now = new Date();
    return this.prisma.shiftAssignment.findMany({
      where: {
        employeeId: id,
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: { shift: true },
      orderBy: { startDate: 'desc' },
    });
  }
}
