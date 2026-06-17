export const env = {
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET,
  resendApiKey: process.env.RESEND_API_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ganttProvider: process.env.NEXT_PUBLIC_GANTT_PROVIDER ?? "timeline-adapter",
  ganttLicenseKey: process.env.GANTT_LICENSE_KEY,
};

function isConfiguredValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim();
  if (!normalized) {
    return false;
  }

  const placeholderFragments = [
    "your-project.supabase.co",
    "your-publishable-key",
    "your-anon-key",
    "your-service-role-key",
  ];

  return !placeholderFragments.some((fragment) => normalized.includes(fragment));
}

export function hasDatabaseConfig() {
  return Boolean(env.databaseUrl);
}

export function hasSupabaseAuthConfig() {
  return (
    isConfiguredValue(env.supabaseUrl) &&
    isConfiguredValue(env.supabasePublishableKey)
  );
}

export function hasSupabaseAdminConfig() {
  return (
    isConfiguredValue(env.supabaseUrl) &&
    isConfiguredValue(env.supabaseServiceRoleKey)
  );
}

export function hasSupabaseStorageConfig() {
  return (
    isConfiguredValue(env.supabaseUrl) &&
    isConfiguredValue(env.supabaseServiceRoleKey) &&
    isConfiguredValue(env.supabaseBucket)
  );
}
