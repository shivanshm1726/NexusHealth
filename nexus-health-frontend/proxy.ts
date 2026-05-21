import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const
protectedPrefixes = ["/dashboard", "/doctor", "/receptionist", "/admin", "/appointments", "/chat", "/doctors"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Simple token presence check — actual validation happens server-side
  const hasToken = request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization");

  // Note: Since we use localStorage (not cookies) for JWT,
  // this middleware mainly handles SSR redirects.
  // Client-side route guards in AuthContext handle the rest.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
