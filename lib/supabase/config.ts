import "server-only";

import { env, hasSupabaseAuthConfig } from "@/lib/env";

export function getSupabaseAuthConfig() {
  if (!hasSupabaseAuthConfig()) {
    throw new Error(
      "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return {
    url: env.supabaseUrl!,
    publishableKey: env.supabasePublishableKey!,
  };
}
