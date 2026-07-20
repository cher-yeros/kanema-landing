import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ELECTIONS_ENABLED } from "@/lib/election-config";

export function middleware(request: NextRequest) {
  if (ELECTIONS_ENABLED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname === "/election" ||
    pathname.startsWith("/election/results") ||
    pathname.startsWith("/election/candidates") ||
    pathname.startsWith("/election/verify")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/election",
    "/election/results/:path*",
    "/election/candidates/:path*",
    "/election/verify/:path*",
  ],
};
