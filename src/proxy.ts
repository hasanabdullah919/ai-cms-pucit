import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'
import { SessionUser } from '@/types'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production'
)
const COOKIE_NAME = 'ai-cms-session'
const SESSION_DURATION = 15 * 60

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value

  let user: SessionUser | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET)
      user = (payload as { user: SessionUser }).user
    } catch {
      user = null
    }
  }

  // Determine if route needs protection
  const isAdminRoute = pathname.startsWith('/admin')
  const isStaffRoute = pathname.startsWith('/staff')
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/my-complaints') ||
    pathname.startsWith('/profile')

  // Redirect unauthenticated users
  if ((isAdminRoute || isStaffRoute || isProtectedRoute) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based protection
  if (isAdminRoute && user && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isStaffRoute && user && user.role !== 'staff' && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Refresh session if user is logged in
  if (user) {
    const response = NextResponse.next()
    try {
      const newToken = await new SignJWT({ user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION}s`)
        .sign(SECRET)

      response.cookies.set(COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION,
        path: '/',
      })

      // Pass user info via headers for server components
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role)
    } catch {
      // Ignore refresh errors
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-complaints/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/staff/:path*',
  ],
}
