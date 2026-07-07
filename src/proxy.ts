import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session if needed (handles cookies)
  const response = await updateSession(request)

  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Omit static assets, APIs, and favicon
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('.')
  ) {
    return response
  }

  // 2. Perform internal rewrite based on the host
  if (hostname.includes('valentes.cl')) {
    url.pathname = `/barberia${url.pathname === '/' ? '' : url.pathname}`
    return NextResponse.rewrite(url, {
      headers: response.headers
    })
  }

  if (hostname.includes('almabela.cl')) {
    url.pathname = `/peluqueria${url.pathname === '/' ? '' : url.pathname}`
    return NextResponse.rewrite(url, {
      headers: response.headers
    })
  }

  // For jeffersonlopes.cl or any other host, return the original response
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
