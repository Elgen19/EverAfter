import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/web3";

const PROTECTED_ROUTES: string[] = [];
const PROTECTED_API_ROUTES = ["/api/protected"];
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true" || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Maintenance Mode redirect
  if (MAINTENANCE_MODE && pathname !== "/coming-soon") {
    return NextResponse.redirect(new URL("/coming-soon", req.url));
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedApiRoute = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute && !isProtectedApiRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("auth-token");
    return response;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-address", payload.address);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/api/protected/:path*",
    "/login/:path*",
    "/dashboard/:path*",
    "/create/:path*",
    "/recipient-setup/:path*",
    "/profile/:path*",
    "/animation/:path*",
    "/letter/:path*",
  ],
};
