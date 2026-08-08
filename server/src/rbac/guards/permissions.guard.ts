import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as { id: string } | undefined;

    if (!user) {
      throw new ForbiddenException('Access denied. User not authenticated.');
    }

    // In a real app, you might cache this or attach permissions to the JWT token.
    // For now, we look up the user's roles and permissions from the DB.
    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userRecord) {
      throw new ForbiddenException('User not found.');
    }

    const userPermissions = new Set<string>();

    for (const ur of userRecord.userRoles) {
      for (const rp of ur.role.permissions) {
        // e.g. "View:User" or "Edit:Settings"
        userPermissions.add(
          `${rp.permission.action}:${rp.permission.resource}`,
        );
      }
    }

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Access denied. Insufficient permissions.');
    }

    return true;
  }
}
