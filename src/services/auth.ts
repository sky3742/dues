import { auth } from "@/auth";
import { createDb } from "@/db";
import { account, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

let bootstrapPromise: Promise<void> | null = null;

export async function ensureAdminUser() {
  if (bootstrapPromise) {
    await bootstrapPromise;
    return;
  }

  bootstrapPromise = (async () => {
    try {
      const adminEmail = process.env.AUTH_ADMIN_EMAIL?.trim().toLowerCase();
      const adminPassword = process.env.AUTH_ADMIN_PASSWORD;
      const adminName = process.env.AUTH_ADMIN_NAME?.trim() || "Dues Admin";
      if (!adminEmail || !adminPassword) {
        return;
      }

      const db = createDb();
      const existingAdmin = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, adminEmail))
        .limit(1);

      if (existingAdmin.length > 0) {
        return;
      }

      const context = await auth.$context;
      const passwordHash = await context.password.hash(adminPassword);
      const now = new Date();
      const userId = crypto.randomUUID();

      await db.insert(user).values({
        id: userId,
        name: adminName,
        email: adminEmail,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      bootstrapPromise = null;
      throw error;
    }
  })();

  await bootstrapPromise;
}

export async function getSession() {
  await ensureAdminUser();
  return auth.api.getSession({
    headers: await headers(),
  });
}
