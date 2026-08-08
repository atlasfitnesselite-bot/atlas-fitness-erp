"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmployeesService = class EmployeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployees(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
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
                orderBy: { [sortBy]: sortOrder },
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
    async getEmployeeById(id) {
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
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        return employee;
    }
    async createEmployee(data) {
        const existing = await this.prisma.employee.findFirst({
            where: {
                OR: [{ employeeId: data.employeeId }, { email: data.email }],
            },
        });
        if (existing) {
            if (existing.employeeId === data.employeeId)
                throw new common_1.ConflictException('Employee ID already exists');
            if (existing.email === data.email)
                throw new common_1.ConflictException('Email already exists');
        }
        const employee = await this.prisma.employee.create({
            data: {
                employeeId: data.employeeId,
                userId: data.userId || null,
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
    async updateEmployee(id, data) {
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
    async deleteEmployee(id) {
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
    async bulkDelete(ids) {
        return this.prisma.employee.deleteMany({
            where: { id: { in: ids } },
        });
    }
    async bulkUpdateStatus(ids, status) {
        return this.prisma.employee.updateMany({
            where: { id: { in: ids } },
            data: { status },
        });
    }
    async getEmployeeNotes(employeeId) {
        return this.prisma.employeeNote.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createEmployeeNote(employeeId, authorId, content, type) {
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
    async getEmployeeDocuments(employeeId) {
        return this.prisma.employeeDocument.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addEmployeeDocument(employeeId, name, fileName, fileUrl, fileSize, mimeType) {
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
    async deleteEmployeeDocument(employeeId, documentId) {
        const doc = await this.prisma.employeeDocument.findUnique({
            where: { id: documentId },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
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
    async getEmployeeAttendance(id, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        const records = await this.prisma.attendance.findMany({
            where: {
                employeeId: id,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: 'asc' },
        });
        const totalPresent = records.filter((r) => r.status === 'PRESENT' || r.clockIn).length;
        const totalAbsent = records.filter((r) => r.status === 'ABSENT').length;
        const totalLate = records.filter((r) => r.lateMinutes > 0).length;
        const totalWorkingHours = records.reduce((sum, r) => sum + (r.workingHours || 0), 0);
        const totalOvertime = records.reduce((sum, r) => sum + (r.overtime || 0), 0);
        return {
            records,
            summary: {
                totalPresent,
                totalAbsent,
                totalLate,
                totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
                totalOvertime: Math.round(totalOvertime * 100) / 100,
                avgWorkingHours: totalPresent > 0
                    ? Math.round((totalWorkingHours / totalPresent) * 100) / 100
                    : 0,
            },
        };
    }
    async getEmployeeLeaveBalance(id) {
        return this.prisma.leaveBalance.findMany({
            where: { employeeId: id },
            include: { leaveType: true },
            orderBy: { year: 'desc' },
        });
    }
    async getEmployeeShifts(id) {
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
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map