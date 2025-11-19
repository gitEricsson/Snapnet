import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Lightweight JwtAuthGuard used for tests and simple local runs.
 * Attaches a default user to the request when none exists so tests depending
 * on request.user (roles, ids) work without the full auth stack.
 *
 * Replace with your real guard implementation in production.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.user) {
      req.user = { id: 'test-user', role: 'ADMIN', employeeId: 'e1' };
    }
    return true;
  }
}