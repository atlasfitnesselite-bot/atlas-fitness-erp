import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;

    // Only log POST, PUT, DELETE, PATCH requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && !url.includes('/auth/login')) {
      return next.handle().pipe(
        tap(() => {
          // Log asynchronously after the request completes successfully
          this.logAction(method, url, body, user).catch(err => {
            console.error('Failed to write audit log', err);
          });
        }),
      );
    }

    return next.handle();
  }

  private async logAction(method: string, url: string, body: any, user: any) {
    let action = 'UNKNOWN';
    if (method === 'POST') action = 'CREATE';
    if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
    if (method === 'DELETE') action = 'DELETE';

    const userId = user?.id || null;
    
    // Attempt to mask sensitive data
    const safeBody = { ...body };
    if (safeBody.password) safeBody.password = '***';

    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: url,
        details: JSON.stringify(safeBody),
      }
    });
  }
}
