import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasSupabaseAuthConfig } from "@/lib/env";
import { getSupabaseAuthConfig } from "@/lib/supabase/config";

export async function updateSession(
  request: NextRequest,
  requestHeaders: Headers,
) {
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!hasSupabaseAuthConfig()) {
    return { response, claims: null };
  }

  const { url, publishableKey } = getSupabaseAuthConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();

  return {
    response,
    claims: error ? null : data?.claims ?? null,
  };
}
