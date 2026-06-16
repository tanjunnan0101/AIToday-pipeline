export const env = {
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET,
  resendApiKey: process.env.RESEND_API_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ganttProvider: process.env.NEXT_PUBLIC_GANTT_PROVIDER ?? "timeline-adapter",
  ganttLicenseKey: process.env.GANTT_LICENSE_KEY,
};

export function hasDatabaseConfig() {
  return Boolean(env.databaseUrl);
}
