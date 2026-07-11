"use server";

import { auth } from "@/auth";
import { isRateLimited, recordAttempt } from "@/services/rateLimit";
import { ensureAdminUser, getSession as getAuthSession } from "@/services/auth";
import { timingSafeCompare } from "@/utils/crypto";
import { cookies } from "next/headers";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function getSession() {
  return getAuthSession();
}

export async function signInWithPasscode(passcode: string) {
  const serverPasscode = process.env.AUTH_PASSCODE;
  const adminEmail = process.env.AUTH_ADMIN_EMAIL;
  const adminPassword = process.env.AUTH_ADMIN_PASSWORD;

  if (!serverPasscode || !adminEmail || !adminPassword) {
    return { error: "Passcode authentication is not configured" };
  }

  if (await isRateLimited("passcode", MAX_ATTEMPTS)) {
    return { error: "Too many attempts. Try again later." };
  }

  if (!passcode || typeof passcode !== "string" || !timingSafeCompare(passcode, serverPasscode)) {
    await recordAttempt("passcode", WINDOW_MS);
    return { error: "Invalid passcode" };
  }

  await ensureAdminUser();

  await auth.api.signInEmail({
    body: { email: adminEmail, password: adminPassword },
  });

  return { ok: true };
}

export async function signOut() {
  const cookie = await cookies();
  const cookieHeader = cookie.toString();

  await auth.api.signOut({
    asResponse: true,
    headers: { cookie: cookieHeader },
  });
}
