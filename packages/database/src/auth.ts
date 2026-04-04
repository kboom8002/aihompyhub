import { RequestContextDTO } from './dto/shared';

// Mock Auth Guard
export function getRequestContext(req: Request): RequestContextDTO {
  const tenantId = req.headers.get('x-tenant-id');
  const roleStr = req.headers.get('x-role');
  
  if (!tenantId) {
    throw new Error("UNAUTHORIZED: Missing x-tenant-id header. Must be a UUID or 'SYSTEM'");
  }

  const activeRole: RequestContextDTO['activeRole'] = 
    (roleStr === 'factory_admin' || roleStr === 'brand_admin' || roleStr === 'editor')
    ? roleStr 
    : 'anonymous';

  return {
    tenantId,
    actorId: 'mock-actor-123', // Hardcoded mock
    activeRole,
    requestId: req.headers.get('x-request-id') || crypto.randomUUID(),
  };
}

/**
 * Ensures the executed block operates STRICTLY under the allowed tenant boundary.
 * Highly recommended for all commands touching tenant-sensitive data.
 * @param context Current Auth Context
 * @param targetTenantId The internal tenant ID embedded in payload/URL param.
 */
export function assertTenantScope(context: RequestContextDTO, targetTenantId: string) {
  // Factory Admins ('SYSTEM') can act upon any tenant boundary.
  if (context.tenantId === 'SYSTEM' && context.activeRole === 'factory_admin') {
     return;
  }
  
  // Strict matching required for Tenant-scoped users.
  if (context.tenantId !== targetTenantId) {
     throw new Error(`SCOPE_LEAK_PREVENTED: Caller operating under tenant [${context.tenantId}] attempted to access resources attached to [${targetTenantId}]. Action Denied by Hardening Layer.`);
  }
}
