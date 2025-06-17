import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const isPublicRoute = [
    "/sign-in",
    "/sign-up",
    "/home"
  ].includes(path);

  // Check if the current path is a verify route
  const isVerifyRoute = path.startsWith('/verify/');

  // If it's a verify route, allow access
  if (isVerifyRoute) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access root path, redirect to home
  if (path === "/" && !token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If the route is public and user is logged in, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the route is protected and user is not logged in, redirect to sign-in
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
