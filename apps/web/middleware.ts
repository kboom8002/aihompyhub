import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('aihompy_session');
  const pathname = request.nextUrl.pathname;

  // Protect all /tenant routes
  if (pathname.startsWith('/tenant')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      const { role, tenantId } = session;

      // Extract the tenantId from the URL if it exists
      // Expected structure: /tenant/[tenantId]/...
      const pathParts = pathname.split('/');
      const requestedTenantId = pathParts.length > 2 ? pathParts[2] : null;

      let mappedTenantId = requestedTenantId;
      if (requestedTenantId === 'dr-oracle') mappedTenantId = '00000000-0000-0000-0000-000000000001';
      else if (requestedTenantId === 'vegan-root') mappedTenantId = '00000000-0000-0000-0000-000000000002';

      // Rule: tenant_admin can only access their own tenant
      if (role === 'tenant_admin' && mappedTenantId && mappedTenantId !== tenantId) {
        // Redirect them back to their own home
        return NextResponse.redirect(new URL(`/tenant/${tenantId}/home`, request.url));
      }
    } catch (e) {
      // Corrupt cookie or parse error
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tenant/:path*'],
};
