import { createDb } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findAllAccounts() {
  const db = createDb();
  return db.select().from(accounts).orderBy(accounts.name);
}

export async function findAccountById(id: string) {
  const db = createDb();
  const [account] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return account ?? null;
}

export async function insertAccount(data: typeof accounts.$inferInsert) {
  const db = createDb();
  const [account] = await db.insert(accounts).values(data).returning();
  return account;
}

export async function updateAccount(id: string, data: Partial<typeof accounts.$inferInsert>) {
  const db = createDb();
  const [account] = await db
    .update(accounts)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(accounts.id, id))
    .returning();
  return account ?? null;
}

export async function deleteAccount(id: string) {
  const db = createDb();
  const [account] = await db.delete(accounts).where(eq(accounts.id, id)).returning();
  return account ?? null;
}
