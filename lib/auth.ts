import "server-only";

import { notFound, redirect } from "next/navigation";

import { listUsers } from "@/lib/data-access";
import { hasSupabaseAuthConfig } from "@/lib/env";
import type { UserRole } from "@/lib/domain";
import { canViewInternalData } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppSession = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
};

async function buildDemoSession() {
  const users = await listUsers();
  const adminUser =
    users.find((entry) => entry.role === "ADMIN") ??
    users.find((entry) => entry.email.toLowerCase() === "admin@aitoday.sg");

  if (!adminUser) {
    throw new Error("No demo admin user is available.");
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    avatar: adminUser.avatar,
  } satisfies AppSession;
}

function normalizeDisplayName(email: string) {
  const [localPart] = email.split("@");
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildFallbackAvatar(name: string) {
  return name
    .split(/\s+/)
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

async function buildSessionFromClaims(claims: Record<string, unknown>) {
  const email = readString(claims.email);
  const sub = readString(claims.sub);

  if (!email || !sub) {
    return null;
  }

  const users = await listUsers();
  const matchedUser = users.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase(),
  );
  const userMetadata =
    claims.user_metadata && typeof claims.user_metadata === "object"
      ? (claims.user_metadata as Record<string, unknown>)
      : undefined;
  const name =
    matchedUser?.name ??
    readString(userMetadata?.name) ??
    normalizeDisplayName(email) ??
    email;

  return {
    id: matchedUser?.id ?? sub,
    email,
    name,
    role: matchedUser?.role ?? "CLIENT_VIEWER",
    avatar: matchedUser?.avatar ?? buildFallbackAvatar(name),
  } satisfies AppSession;
}

export async function getOptionalSession() {
  if (!hasSupabaseAuthConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return null;
  }

  return buildSessionFromClaims(data.claims as Record<string, unknown>);
}

export async function requireSession() {
  if (!hasSupabaseAuthConfig()) {
    return buildDemoSession();
  }

  const session = await getOptionalSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function getOptionalInternalSession() {
  const session = await getOptionalSession();
  if (!session || !canViewInternalData(session.role)) {
    return null;
  }

  return session;
}

export async function requireInternalSession() {
  const session = await requireSession();
  if (!canViewInternalData(session.role)) {
    if (!hasSupabaseAuthConfig()) {
      return buildDemoSession();
    }

    redirect("/portal");
  }

  return session;
}

export async function requireInternalPageAccess() {
  const session = await requireSession();
  if (!canViewInternalData(session.role)) {
    if (!hasSupabaseAuthConfig()) {
      return buildDemoSession();
    }

    notFound();
  }

  return session;
}
