import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getEmployees(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('designationId') designationId?: string,
    @Query('employmentTypeId') employmentTypeId?: string,
    @Query('status') status?: string,
    @Query('managerId') managerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.employeesService.getEmployees({
      search,
      departmentId,
      designationId,
      employmentTypeId,
      status,
      managerId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('org-structure')
  async getOrgStructure() {
    return this.employeesService.getOrgStructure();
  }



  @Roles('OWNER', 'MANAGER')
  @Post()
  async createEmployee(@Body() data: CreateEmployeeDto) {
    return this.employeesService.createEmployee(data);
  }

  @Roles('OWNER', 'MANAGER')
  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() data: CreateEmployeeDto,
  ) {
    return this.employeesService.updateEmployee(id, data);
  }

  @Roles('OWNER', 'MANAGER')
  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    return this.employeesService.deleteEmployee(id);
  }

  @Roles('OWNER', 'MANAGER')
  @Post('bulk-delete')
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.employeesService.bulkDelete(body.ids);
  }

  @Roles('OWNER', 'MANAGER')
  @Post('bulk-status')
  async bulkUpdateStatus(@Body() body: { ids: string[]; status: string }) {
    return this.employeesService.bulkUpdateStatus(body.ids, body.status);
  }

  @Roles('OWNER', 'MANAGER')
  @Post('import')
  async importEmployees(@Body() body: { employees: CreateEmployeeDto[] }) {
    const results = [];
    for (const emp of body.employees) {
      try {
        const created = await this.employeesService.createEmployee(emp);
        results.push({ email: emp.email, success: true, id: created.id });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error onboarding employee';
        results.push({
          email: emp.email,
          success: false,
          error: message,
        });
      }
    }
    return { success: true, results };
  }

  @Get(':id/attendance')
  async getEmployeeAttendance(
    @Param('id') id: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.employeesService.getEmployeeAttendance(
      id,
      month ? parseInt(month) : new Date().getMonth() + 1,
      year ? parseInt(year) : new Date().getFullYear(),
    );
  }

  @Get(':id/leave-balance')
  async getEmployeeLeaveBalance(@Param('id') id: string) {
    return this.employeesService.getEmployeeLeaveBalance(id);
  }

  @Get(':id/shifts')
  async getEmployeeShifts(@Param('id') id: string) {
    return this.employeesService.getEmployeeShifts(id);
  }

  @Get(':id/notes')
  async getEmployeeNotes(@Param('id') id: string) {
    return this.employeesService.getEmployeeNotes(id);
  }

  @Post(':id/notes')
  async createEmployeeNote(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
    @Body() body: { content: string; type: string },
  ) {
    if (!req.user || !req.user.id) throw new UnauthorizedException();
    return this.employeesService.createEmployeeNote(
      id,
      req.user.id,
      body.content,
      body.type,
    );
  }

  @Get(':id/documents')
  async getEmployeeDocuments(@Param('id') id: string) {
    return this.employeesService.getEmployeeDocuments(id);
  }

  @Post(':id/documents')
  async addEmployeeDocument(
    @Param('id') id: string,
    @Body()
    body: {
      name: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
    },
  ) {
    return this.employeesService.addEmployeeDocument(
      id,
      body.name,
      body.fileName,
      body.fileUrl,
      body.fileSize,
      body.mimeType,
    );
  }

  @Delete(':id/documents/:docId')
  async deleteEmployeeDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return this.employeesService.deleteEmployeeDocument(id, docId);
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(id);
  }
}
