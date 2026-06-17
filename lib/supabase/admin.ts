import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseStorageConfig } from "@/lib/env";

let adminClient: ReturnType<typeof createClient> | null = null;

export function createSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  if (!hasSupabaseStorageConfig()) {
    throw new Error(
      "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.",
    );
  }

  adminClient = createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
