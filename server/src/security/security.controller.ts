import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../rbac/guards/roles.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('security')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('OWNER', 'ADMIN') // Only Owner and Admin can see security logs
export class SecurityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('logins')
  async getLoginHistory() {
    return this.prisma.loginHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    });
  }

  @Get('audits')
  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    });
  }
}
