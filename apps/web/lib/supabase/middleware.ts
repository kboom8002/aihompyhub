import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate the user's JWT session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (!user && pathname.startsWith('/tenant') && pathname !== '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated, we need to apply RBAC
  if (user && (pathname.startsWith('/tenant') || pathname.startsWith('/factory') || pathname.startsWith('/pending'))) {
    
    // Fetch the user_profile. 
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single()

    console.log('[MW DEBUG] user.id=', user.id);
    console.log('[MW DEBUG] profile=', profile);
    console.log('[MW DEBUG] error=', error);

    if (!profile) {
       // If no profile yet, maybe redirect to an onboarding or error page, but for now we treat as pending_admin
       const url = request.nextUrl.clone()
       url.pathname = '/pending'
       // prevent loops
       if (pathname !== '/pending') return NextResponse.redirect(url)
       return supabaseResponse
    }

    const { role, tenant_id } = profile

    // Super Admin: Can go anywhere. Just block pending/login pages if they go there
    if (role === 'super_admin') {
      if (pathname === '/pending' || pathname === '/login' || pathname === '/tenant/home' || pathname === '/tenant') {
         const url = request.nextUrl.clone()
         url.pathname = '/factory'
         return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Pending Admin: Can ONLY go to /pending
    if (role === 'pending_admin') {
      if (pathname !== '/pending') {
         const url = request.nextUrl.clone()
         url.pathname = '/pending'
         return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Tenant Admin: Can go to their specific tenant pages
    if (role === 'tenant_admin') {
      const pathParts = pathname.split('/')
      const requestedSlug = pathParts.length > 2 ? pathParts[2] : null

      // If they try to access factory, block
      if (pathname.startsWith('/factory')) {
        const url = request.nextUrl.clone()
        url.pathname = `/tenant/${tenant_id}/home`
        return NextResponse.redirect(url)
      }
      
      // If no valid UUID in URL and trying to access /tenant or /tenant/home generically
      if (pathname === '/tenant' || pathname === '/tenant/home') {
        const url = request.nextUrl.clone()
        url.pathname = `/tenant/${tenant_id}/home`
        return NextResponse.redirect(url)
      }

      if (!tenant_id) {
        const url = request.nextUrl.clone()
        url.pathname = '/pending'
        return NextResponse.redirect(url)
      }

      if (pathname === '/pending') {
        const url = request.nextUrl.clone()
        url.pathname = `/tenant/${tenant_id}/home`
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
