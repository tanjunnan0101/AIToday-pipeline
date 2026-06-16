import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";

const publicPrefixes = ["/login", "/portal", "/_next", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", request.nextUrl.pathname);
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const isPublic = publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const session = await getSessionFromRequest(request);

  if (!isPublic && !session && (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/clients") || pathname.startsWith("/documents") || pathname.startsWith("/gantt") || pathname.startsWith("/handover") || pathname.startsWith("/implementation-plans") || pathname.startsWith("/kanban") || pathname.startsWith("/notifications") || pathname.startsWith("/reports") || pathname.startsWith("/settings") || pathname.startsWith("/tasks") || pathname.startsWith("/time-logs") || pathname.startsWith("/workload") || isApiRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
