import { createDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findSubscriptionByEndpoint(endpoint: string) {
  const db = createDb();
  const [sub] = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint))
    .limit(1);
  return sub ?? null;
}

export async function insertSubscription(data: typeof pushSubscriptions.$inferInsert) {
  const db = createDb();
  const [sub] = await db.insert(pushSubscriptions).values(data).returning();
  return sub;
}

export async function deleteSubscriptionByEndpoint(endpoint: string) {
  const db = createDb();
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function findAllSubscriptions() {
  const db = createDb();
  return db.select().from(pushSubscriptions);
}
