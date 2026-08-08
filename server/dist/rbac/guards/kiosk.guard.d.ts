import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class KioskGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
