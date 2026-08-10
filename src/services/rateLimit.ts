import { createDb } from "@/db";
import { rateLimit } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getEntry(key: string) {
  const db = createDb();
  const [entry] = await db.select().from(rateLimit).where(eq(rateLimit.key, key)).limit(1);
  return entry;
}

export async function isRateLimited(key: string, maxAttempts: number): Promise<boolean> {
  const entry = await getEntry(key);
  return !!entry && Date.now() <= entry.resetAt && entry.count >= maxAttempts;
}

export async function recordAttempt(key: string, windowMs: number): Promise<void> {
  const db = createDb();
  const now = Date.now();
  const entry = await getEntry(key);

  if (!entry || now > entry.resetAt) {
    await db
      .insert(rateLimit)
      .values({ key, count: 1, resetAt: now + windowMs })
      .onConflictDoUpdate({
        target: rateLimit.key,
        set: { count: 1, resetAt: now + windowMs },
      });
  } else {
    await db
      .update(rateLimit)
      .set({ count: entry.count + 1 })
      .where(eq(rateLimit.key, key));
  }
}
