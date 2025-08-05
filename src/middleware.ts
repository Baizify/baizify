import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Middleware for requests.
 * @param request - The NextRequest
 * @returns The requested resource or redirect.
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: "YoNO0fuPwdSfuQonft2uXeEnzcod5uG/07h5XboQE1U=" })
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  return NextResponse.next()
}

/**
 * Middleware config.
 */
export const config = {
  matcher: [
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|txt|xml|pdf)$).*)',
  ]
}