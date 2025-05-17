import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/";

  // Get the token from cookies
  const token = request.cookies.get("auth_token")?.value || "";

  // If trying to access protected path without token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access login page with token, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Specify the paths that this middleware should apply to
export const config = {
  matcher: [
    // Apply to all paths except api routes, _next, static files, etc.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
