import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session if needed
  const response = await updateSession(request)

  const url = request.nextUrl.clone()
  const hostname = (request.headers.get('host') || '').toLowerCase()
  const paramBrand = (url.searchParams.get('brand') || url.searchParams.get('domain') || '').toLowerCase()

  // Omit static assets, APIs, favicon, admin, and giftcards
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/giftcards') ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('.')
  ) {
    return response
  }

  // 2. Valentes domain isolation (valentes.cl or ?brand=valentes)
  if (hostname.includes('valentes') || paramBrand === 'valentes') {
    // Prevent accessing Peluquería or Terapias on valentes.cl
    if (url.pathname.startsWith('/peluqueria') || url.pathname.startsWith('/terapias')) {
      url.pathname = '/barberia'
      return NextResponse.redirect(url)
    }
    // Rewrite root / to /barberia for single-brand experience
    if (url.pathname === '/') {
      url.pathname = '/barberia'
      return NextResponse.rewrite(url, { headers: response.headers })
    }
  }

  // 3. Alma Bela domain isolation (almabela.cl or ?brand=almabela)
  if (hostname.includes('almabela') || paramBrand === 'almabela') {
    // Prevent accessing Barbería on almabela.cl (allows Peluquería and Terapias)
    if (url.pathname.startsWith('/barberia')) {
      url.pathname = '/peluqueria'
      return NextResponse.redirect(url)
    }
    // Rewrite root / to /peluqueria for single-brand experience
    if (url.pathname === '/') {
      url.pathname = '/peluqueria'
      return NextResponse.rewrite(url, { headers: response.headers })
    }
  }

  // 4. Jefferson Lopes domain (jeffersonlopes.cl or default)
  // Keeps full multi-brand portal (Barbería, Peluquería, Terapias) intact
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
