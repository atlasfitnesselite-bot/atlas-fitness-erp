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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = class SearchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async globalSearch(query) {
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
        const [members, employees, invoices, equipment, tasks, companyDocs, employeeDocs, memberDocs] = await Promise.all([
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
            this.prisma.equipment.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm } },
                        { category: { contains: searchTerm } },
                    ],
                },
                take: 5,
            }),
            this.prisma.task.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm } },
                        { description: { contains: searchTerm } },
                    ],
                },
                take: 5,
            }),
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
        const documents = [
            ...companyDocs.map(d => ({ ...d, docType: 'COMPANY' })),
            ...employeeDocs.map(d => ({ ...d, docType: 'EMPLOYEE', title: d.name })),
            ...memberDocs.map(d => ({ ...d, docType: 'MEMBER' }))
        ].slice(0, 5);
        return {
            members,
            employees,
            invoices,
            equipment,
            tasks,
            documents
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map