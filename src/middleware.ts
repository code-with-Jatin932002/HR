// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We are intentionally not checking for a token here to allow for tab-specific sessions.
  // The client-side application state (in AuthContext and useProtectRoute) will handle
  // the redirection to the home page if a user is not authenticated.
  return NextResponse.next();
}

// The matcher remains to apply this middleware to the dashboard routes.
// It will now just pass through without performing any checks.
export const config = {
  matcher: ['/dashboard/:path*'],
};