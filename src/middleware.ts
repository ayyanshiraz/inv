import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Read the session cookie
  const session = request.cookies.get('session')?.value

  // 2. Where is the user trying to go?
  const isOnLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isStaticFile = request.nextUrl.pathname.includes('.') // Images, CSS, etc.

  // 3. LOGIC:
  
  // If user has NO session, and is NOT on login page -> Send to Login
  if (!session && !isOnLoginPage && !isStaticFile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user HAS session, and IS on login page -> Send to Dashboard
  if (session && isOnLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Config to prevent middleware from running on static files/images
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}