import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import type { User } from "@/lib/domain";

const sessionCookieName = "aitoday_session";
const sessionDuration = 60 * 60 * 24 * 7;

type SessionPayload = Pick<User, "id" | "email" | "name" | "role"> & {
  avatar?: string;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "aitoday-dev-session-secret";
}

function getEncodedSecret() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .sign(getEncodedSecret());
}

export async function decryptSession(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ["HS256"],
    });

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDuration,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(sessionCookieName)?.value);
}

export { sessionCookieName };
