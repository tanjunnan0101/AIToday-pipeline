"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env, hasSupabaseAuthConfig } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  if (!hasSupabaseAuthConfig()) {
    throw new Error(
      "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  browserClient = createBrowserClient(
    env.supabaseUrl!,
    env.supabasePublishableKey!,
  );

  return browserClient;
}
