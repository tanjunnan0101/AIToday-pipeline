import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasSupabaseAuthConfig } from "@/lib/env";
import { updateSession } from "@/lib/supabase/proxy";

const publicPrefixes = ["/login", "/portal", "/api/documents", "/_next", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", request.nextUrl.pathname);
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const isPublic = publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const { response, claims } = await updateSession(request, requestHeaders);
  const session = claims?.sub ? claims : null;

  if (!isPublic && !session && (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/clients") || pathname.startsWith("/documents") || pathname.startsWith("/gantt") || pathname.startsWith("/handover") || pathname.startsWith("/implementation-plans") || pathname.startsWith("/kanban") || pathname.startsWith("/notifications") || pathname.startsWith("/reports") || pathname.startsWith("/settings") || pathname.startsWith("/tasks") || pathname.startsWith("/time-logs") || pathname.startsWith("/workload") || isApiRoute)) {
    if (!hasSupabaseAuthConfig()) {
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
