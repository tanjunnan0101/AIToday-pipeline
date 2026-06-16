import "server-only";

import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { listUsers } from "@/lib/data-access";
import { decryptSession, getSessionFromCookies } from "@/lib/session";

export async function authenticateDemoUser(email: string, password: string) {
  const users = await listUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user || password !== "demo-password") {
    return null;
  }

  return user;
}

export async function getOptionalSession() {
  return getSessionFromCookies();
}

export async function requireSession() {
  const session = await getOptionalSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function getSessionFromRequest(request: NextRequest) {
  return decryptSession(request.cookies.get("aitoday_session")?.value);
}
