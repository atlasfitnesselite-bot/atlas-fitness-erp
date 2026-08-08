import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return {
        members: [],
        employees: [],
        invoices: [],
        equipment: [],
        tasks: [],
        documents: [],
      };
    }

    const searchTerm = query.trim();

    // Run searches in parallel
    const [
      members,
      employees,
      invoices,
      equipment,
      tasks,
      companyDocs,
      employeeDocs,
      memberDocs
    ] = await Promise.all([
      // 1. Members
      this.prisma.member.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { mobile: { contains: searchTerm } },
          ],
        },
        take: 5,
      }),

      // 2. Employees
      this.prisma.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { mobile: { contains: searchTerm } },
          ],
        },
        take: 5,
      }),

      // 3. Invoices
      this.prisma.invoice.findMany({
        where: {
          OR: [
            { transactionReference: { contains: searchTerm } },
            { member: { firstName: { contains: searchTerm } } },
            { member: { lastName: { contains: searchTerm } } },
          ],
        },
        include: { member: true },
        take: 5,
      }),

      // 4. Equipment
      this.prisma.equipment.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { category: { contains: searchTerm } },
          ],
        },
        take: 5,
      }),

      // 5. Tasks
      this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 5,
      }),

      // 6. Documents (Company, Employee, Member)
      this.prisma.companyDocument.findMany({
        where: { title: { contains: searchTerm } },
        take: 5,
      }),
      this.prisma.employeeDocument.findMany({
        where: { name: { contains: searchTerm } },
        take: 5,
      }),
      this.prisma.memberDocument.findMany({
        where: { title: { contains: searchTerm } },
        take: 5,
      }),
    ]);

    // Standardize documents array
    const documents = [
      ...companyDocs.map(d => ({ ...d, docType: 'COMPANY' })),
      ...employeeDocs.map(d => ({ ...d, docType: 'EMPLOYEE', title: d.name })),
      ...memberDocs.map(d => ({ ...d, docType: 'MEMBER' }))
    ].slice(0, 5); // Limit combined docs to 5

    return {
      members,
      employees,
      invoices,
      equipment,
      tasks,
      documents
    };
  }
}
