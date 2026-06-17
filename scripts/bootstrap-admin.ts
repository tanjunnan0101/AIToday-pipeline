import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseAdminConfig } from "@/lib/env";

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@aitoday.sg";
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME ?? "Tanja Nunn";

async function main() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error(
      "Supabase admin access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.",
    );
  }

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "Set ADMIN_PASSWORD to a value with at least 8 characters before running this script.",
    );
  }

  const supabase = createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: existingUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    throw new Error(`Unable to list Supabase users: ${listError.message}`);
  }

  const existingUser = existingUsers.users.find(
    (user) => user.email?.toLowerCase() === adminEmail.toLowerCase(),
  );

  if (existingUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: adminName,
        },
      },
    );

    if (updateError) {
      throw new Error(`Unable to update admin user: ${updateError.message}`);
    }

    console.log(`Updated Supabase admin user ${adminEmail}.`);
    return;
  }

  const { error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      name: adminName,
    },
  });

  if (createError) {
    throw new Error(`Unable to create admin user: ${createError.message}`);
  }

  console.log(`Created Supabase admin user ${adminEmail}.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
